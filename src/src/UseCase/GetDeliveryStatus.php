<?php
namespace App\UseCase;

use App\Repository\DeliveryRepository;

class GetDeliveryStatus{

    public function __construct(
        private DeliveryRepository $deliveryRepository
    ){}

    public function execute($request){
        $dataLink = $request->query->get('link'); 
        $dataLinkArray = explode('/', $dataLink);
        $link = $dataLinkArray[1];
        if(!$link) return false;
        $delivery = $this->deliveryRepository->findOneBy(array('hashed_value' => $link));
        return $delivery->getStatus();
    }
}