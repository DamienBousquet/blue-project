<?php
namespace App\Command;

use App\MessageHandler\DeliveryPersonBehaviorMessage;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use App\Repository\OrderRepository;

#[AsCommand(name: 'app:delivery-person-behavior-worker')]
class DeliveryPersonBehaviorWorkerCommand extends Command
{
    public function __construct(
        private MessageBusInterface $bus,
        private OrderRepository $orderRepository
    ) {
        parent::__construct();
    }

    protected function execute($input, $output): int
    {
         while (true) {
            $orders = $this->orderRepository->findRecentPaidOrders();
            foreach ($orders as $order) {
                $this->bus->dispatch(new DeliveryPersonBehaviorMessage($order->getId()));
            }
            sleep(20);
        }
    }
}