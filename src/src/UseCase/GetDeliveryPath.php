<?php
namespace App\UseCase;

use App\Service\OSRMService;
use App\Repository\DeliveryRepository;
use App\Repository\UserRepository;

class GetDeliveryPath{
    public function __construct(
        private DeliveryRepository $deliveryRepository,
        private OSRMService $OSRMService,
        private UserRepository $userRepository
    ){}

    public function execute($link){
        if(!$link) return [];
        $delivery = $this->deliveryRepository->findOneBy(array("hashed_value" => $link));
        $startPoint = [];
        $startPoint[0] = $delivery->getOrderId()->getFoodPlaceId()->getLongitude();
        $startPoint[1] = $delivery->getOrderId()->getFoodPlaceId()->getLatitude();
        $endPoint = [];
        $order = $delivery->getOrderId();
        $user = $this->userRepository->findOneBy(array('session_id' => $order->getUserSessionId()));
        $endPoint[0] = $user->getLongitude();
        $endPoint[1] = $user->getLatitude();
        $OSRMData = $this->OSRMService->sendRequestToOSRM($startPoint, $endPoint);
        $points = $OSRMData['routes'][0]['geometry']['coordinates'];
        array_unshift($points, $startPoint);
        array_push($points, $endPoint);
        return $points;
    }
}