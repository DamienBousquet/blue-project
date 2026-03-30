<?php
namespace App\Serializer;

use App\Entity\Order;

class OrderSerializer
{

    public function serialize(
        Order $order,
    ): array {
        $statusMap = [
            'OUT_FOR_DELIVERY' => 'Livraison en cours',
            'PAID' => 'Payée',
            'DONE' => 'Livrée',
            'CANCELED' => 'Annulée' 
        ];

        return [
            'id' => $order->getId(),
            'foodPlaceName' => $order->getFoodPlaceId()->getName(),
            'status' => $statusMap[$order->getStatus()] ?? $order->getStatus(),
            'totalPrice' => $order->getTotalPrice(),
            'createdAt' => $order->getCreatedAt(),
        ];
    }


    public function serializeCollection(array $orders): array
    {
        return array_map(
            fn(Order $order) => $this->serialize($order
            ),$orders
        );
    }
}