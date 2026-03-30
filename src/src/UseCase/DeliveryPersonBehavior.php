<?php
namespace App\UseCase;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Delivery;
use App\Entity\DeliveryLocation;
use DateTimeImmutable;
use DateTime;
use App\Service\OSRMService;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Mercure\HubInterface;
use App\Repository\UserRepository;
use App\Repository\UtilsRepository;

class DeliveryPersonBehavior{
    public function __construct(
        private EntityManagerInterface $em, 
        private UserRepository $userRepository,
        private UtilsRepository $utilsRepository,
        private OSRMService $OSRMService,
        private HubInterface $hub){}

    public function execute($order){
        $user = $this->userRepository->findOneBy(array('session_id' => $order->getUserSessionId()));

        $foodPlaceLongitude = (float)$order->getFoodPlaceId()->getLongitude();
        $foodPlaceLatitude = (float)$order->getFoodPlaceId()->getLatitude();
        $foodPlacePoint = [$foodPlaceLongitude, $foodPlaceLatitude];

        $homeLongitude = (float)$user->getLongitude();
        $homeLatitude = (float)$user->getLatitude();
        $homePoint = [$homeLongitude, $homeLatitude];

        $deliveryPerson = $this->OSRMService->getNearestAvailableDeliveryPerson($order->getFoodPlaceId());
        $deliveryPersonLongitude = (float)$deliveryPerson->getLongitude();
        $deliveryPersonLatitude = (float)$deliveryPerson->getLatitude();
        $deliveryPersonPoint = [$deliveryPersonLongitude, $deliveryPersonLatitude];

        $data = $this->OSRMService->sendRequestToOSRM($deliveryPersonPoint, $homePoint, [$foodPlacePoint]);

        $pointDurations = $this->buildPoints($data);
        $order->setStatus('OUT_FOR_DELIVERY');
        ["delivery" => $delivery, "deliveryLocation" => $deliveryLocation] = $this->createDelivery($order, $homePoint);
        $this->em->persist($delivery);
        $this->em->persist($deliveryLocation);
        $this->em->flush();

        $topic = 'delivery/' . $delivery->getHashedValue();
        $totalDurationJourney = $data['routes'][0]['duration'];
        $totalDuration = 0;
        for ($i=0; $i < sizeof($pointDurations) - 1 ; $i++) { 
            $nextTime = (float)$pointDurations[$i + 1]["duration"];
            $currentPointTime = (float)$pointDurations[$i]["duration"];
            $waitingTime = $nextTime - $currentPointTime;
            sleep($waitingTime);
            $totalDuration += $waitingTime;
            if($totalDuration > 2000) break;
            $timeLeft = $totalDurationJourney - $totalDuration;
            $timeLeft = round($timeLeft, 2);
            $update = new Update($topic,json_encode(['location' => $pointDurations[$i]["point"], "timeLeft" => $timeLeft]));
            $this->hub->publish($update);
        }
        $update = new Update($topic,json_encode(['location' => null, "timeLeft" => 0]));
        $this->hub->publish($update);
        $delivery->setStatus('DONE');
        $delivery->setCompletedAt($this->getDeliveryCompletedAt($order->getUserSessionId()));
        $order->setStatus('DONE');
        $this->em->persist($delivery);
        $this->em->flush();

    }

    private function generateRandomString($length = 20) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';

        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[random_int(0, $charactersLength - 1)];
        }

        return $randomString;
    }
    
    private function buildPoints($data): array
    {
        $cumulativeDuration = 0;
        $pointDurations = [];

        foreach ($data['routes'][0]['legs'] as $leg) {
            foreach ($leg['steps'] as $step) {
                $stepDuration = $step['duration'];
                $points = $step['geometry']['coordinates'];
                $numPoints = count($points);

                for ($i = 0; $i < $numPoints; $i++) {
                    $ratio = $i / ($numPoints - 1);
                    $pointDurations[] = [
                        'point' => $points[$i],
                        'duration' => $cumulativeDuration + ($ratio * $stepDuration)
                    ];
                }

                $cumulativeDuration += $stepDuration;
            }
        }

        return $pointDurations;
    }

    private function createDelivery($order,$endPoint): ?array{
        $delivery = new Delivery();
        $delivery->setOrderId($order);
        $now = new DateTime();
        $currentHour = (int)$now->format('H');
        $currentMinute = (int)$now->format('i');
        $currentSecond = (int)$now->format('s');
        $date = new DateTimeImmutable('2012-04-09 '.$currentHour.':'.$currentMinute.':'.$currentSecond);
        $delivery->setStartedAt($date);
        $delivery->setStatus('ON_THE_WAY');
        $delivery->setHashedValue($this->generateRandomString(20));

        $deliveryLocation = new DeliveryLocation();
        $deliveryLocation->setCreatedAt($date);
        $deliveryLocation->setDeliveryId($delivery);
        $deliveryLocation->setLongitude($endPoint[0]);
        $deliveryLocation->setLatitude($endPoint[1]);

        $result = [
                    'delivery' => $delivery,
                    'deliveryLocation' => $deliveryLocation,
                ];
        return $result;
    }

    private function getDeliveryCompletedAt($sessionId){
        $user = $this->userRepository->findOneBy(array('session_id' => $sessionId));
        $timeCreatedUser = $user->getCreatedAt();
        $now = new DateTimeImmutable();
        $difference = $timeCreatedUser->diff($now);
        $util = $this->utilsRepository->findOneBy(array('name' => 'timeFront'));
        $timeFrontDefaultText = $util->getValue();
        $timeFrontDefault = new DateTimeImmutable($timeFrontDefaultText);
        $deliveryTime = $timeFrontDefault->add($difference);
        return $deliveryTime;
    }
}