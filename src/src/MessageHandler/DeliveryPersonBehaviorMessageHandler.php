<?php
namespace App\MessageHandler;

use App\MessageHandler\DeliveryPersonBehaviorMessage;
use App\UseCase\DeliveryPersonBehavior;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use App\Repository\OrderRepository;

#[AsMessageHandler]
class DeliveryPersonBehaviorMessageHandler
{
    public function __construct(
        private DeliveryPersonBehavior $deliveryPersonBehavior,
        private OrderRepository $orderRepository
    ){}

    public function __invoke(DeliveryPersonBehaviorMessage $message)
    {
        $order = $this->orderRepository->find($message->getOrderId());
        if ($order) {
            $this->deliveryPersonBehavior->execute($order);
        }
    }
}
