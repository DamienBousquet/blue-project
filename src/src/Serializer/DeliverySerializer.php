<?php
namespace App\Serializer;

use App\Entity\Delivery;

class DeliverySerializer
{

    public function serialize(
        Delivery $delivery,
    ): array {

        return [
            'id' => $delivery->getId(),
            'order' => $delivery->getOrderId(),
            'status' => $delivery->getStatus(),
            'hashedValue' => $delivery->getHashedValue(),
            'createdAt' => $delivery->getStartedAt(),
        ];
    }


    public function serializeCollection(array $deliveries): array
    {
        return array_map(
            fn(Delivery $delivery) => $this->serialize($delivery
            ),$deliveries
        );
    }
}