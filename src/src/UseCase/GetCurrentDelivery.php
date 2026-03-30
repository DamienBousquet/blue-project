<?php
namespace App\UseCase;

use App\Repository\OrderRepository;
use App\Repository\DeliveryRepository;
use App\Serializer\DeliverySerializer;

class GetCurrentDelivery{

    public function __construct(
        private OrderRepository $orderRepository,
        private DeliveryRepository $deliveryRepository,
        private DeliverySerializer $deliverySerializer
    ){}

    public function execute($sessionId)    {
        $order = $this->orderRepository->findOneBy([
            'user_session_id' => $sessionId,
            'status' => 'OUT_FOR_DELIVERY'
        ]);
        if (!$order) {
            $order = $this->orderRepository->findOneBy([
                'user_session_id' => $sessionId,
                'status' => 'PAID'
            ]);
            if ($order) {
                return [null,'Votre commande va bientôt être lancée, veuillez rafraîchir la page'];
            }
        }
        if ($order) {
            $delivery = $this->deliveryRepository->findOneBy([
                'order_id' => $order
            ]);
            if ($delivery) {
                return [$this->deliverySerializer->serialize($delivery),'Une commande est en cours de livraison, cliquez pour voir le suivi'];
            }
        }
        return [];
    }
}