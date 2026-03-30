<?php
namespace App\Service;
use App\Entity\DeliveryPerson;
use stdClass;
use App\Service\RestaurantOfTheDayService;
use App\Repository\OrderRepository;

class OSRMService
{
    private $deliveryPerson1;
    private $deliveryPerson2;
    private $arrayDeliveryPerson= [];

    public function __construct() {
        $this->deliveryPerson1 = new DeliveryPerson(1, 3.928817, 43.58832, false);
        $this->deliveryPerson2 = new DeliveryPerson(2, 3.912517, 43.570014, false);

        $this->arrayDeliveryPerson = [$this->deliveryPerson1, $this->deliveryPerson2];
    }

    public function getNearestAvailableDeliveryPerson($foodPlace){
        $totalDurations = [];
        foreach ($this->arrayDeliveryPerson as $key => $value) {
            if($value->isAvailable() === false) continue;
            $startPoint = [$value->getLongitude(), $value->getLatitude()];
            $endPoint = [$foodPlace->getLongitude(), $foodPlace->getLatitude()];
            $data = $this->sendRequestToOSRM($startPoint,$endPoint);
            $totalDuration = $data['routes'][0]['duration'];
            array_push($totalDurations, [$value, $totalDuration]);
        }

        if (empty($totalDurations)) {
            return null;
        }
        $minEntry = array_reduce($totalDurations, function ($carry, $item) {
            return ($carry === null || $item[1] < $carry[1]) ? $item : $carry;
        }, null);
        return $minEntry[0];
    }

    public function getEstimatedTimesFromFoodPlace($user, $foodPlaces){
        $startPoint = [$user->getLongitude(), $user->getLatitude()];
        $estimatedTimes = [];
        foreach ($foodPlaces as $foodPlace) {
            $endPoint = [$foodPlace->getLongitude(), $foodPlace->getLatitude()];
            $data = $this->sendRequestToOSRM($startPoint, $endPoint);   
            $totalDuration = $data['routes'][0]['duration'];
            if($totalDuration){
                //adding 4 minutes to simulate the journey from the delivery person to the foodPlace (it is an estimated time, not real)
                $totalDuration += 4*60;
            }
            array_push($estimatedTimes, ["id" => $foodPlace->getId(), "timeDelivery" => $totalDuration]);
        }
        return $estimatedTimes;
    }

    public function sendRequestToOSRM($startPoint, $endPoint, $wayPoints = null): array{
            $url = $this->getOSRMUrl($startPoint, $endPoint, $wayPoints);
            $ch = curl_init();
            curl_setopt($ch,CURLOPT_URL, $url);
            curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($ch);
            $data = json_decode($result, true);
            return $data;
    }

    private function getOSRMUrl($startPoint, $endPoint, $wayPoints = null){
        $osrm_path = $_ENV['OSRM_URL'];
        if($wayPoints == null) 
        return $osrm_path . 'route/v1/driving/' . $startPoint[0] . ',' . $startPoint[1] . ';' 
            . $endPoint[0] . ',' . $endPoint[1] . '?steps=true&geometries=geojson';
        else{
            $points = $startPoint[0] . ',' . $startPoint[1] . ';';
            foreach ($wayPoints as $wayPoint) {
                $points .= $wayPoint[0] . ',' . $wayPoint[1] . ';';
            }
            $points .= $endPoint[0] . ',' . $endPoint[1];
        }
        return $osrm_path . 'route/v1/driving/' . $points . '?steps=true&geometries=geojson';
    }

}