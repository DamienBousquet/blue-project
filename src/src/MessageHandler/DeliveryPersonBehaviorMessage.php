<?php
namespace App\MessageHandler;

class DeliveryPersonBehaviorMessage
{
    public function __construct(
        private int $orderId
    ) {}

    public function getOrderId(): int
    {
        return $this->orderId;
    }
}