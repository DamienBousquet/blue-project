<?php
namespace App\Service;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Repository\OrderRepository;
use App\Repository\DishRepository;
use Doctrine\ORM\EntityManagerInterface;
use DateTimeImmutable;
use DateTime;
use App\Repository\UserRepository;
use App\Repository\UtilsRepository;
use App\Exception\InvalidOrderException;

class OrderService
{
    private $orderDishMaxQuantity = 9;

    public function __construct(
        private OrderRepository $orderRepository, 
        private DishRepository $dishRepository,
        private EntityManagerInterface $em,
        private UserRepository $userRepository,
        private UtilsRepository $utilsRepository
    ){}

    public function create($sessionId, $totalPrice, $dishes, $dishesPrice): ?Order{
        $foodPlace = $dishes[0]->getFoodPlaceId();
        $order = new Order();
        $order->setFoodPlaceId($foodPlace);
        $order->setStatus('PENDING');
        $order->setTotalPrice($totalPrice);
        $order->setUserSessionId($sessionId);
        $orderTime = $this->getOrderTime($sessionId);
        $order->setCreatedAt($orderTime);
        
        $this->em->persist($order);

        $this->createOrderItems($order, $dishes,$dishesPrice);

        $this->em->flush();

        return $order;
    }

    public function createOrderItems($order, $dishes, $dishesPrice){
        $dishQuantities = [];
        foreach ($dishes as $dish) {
            $dishId = $dish->getId();
            if (!isset($dishQuantities[$dishId])) {
                $dishQuantities[$dishId] = [
                    'dish' => $dish,
                    'quantity' => 0,
                ];
            }
            $dishQuantities[$dishId]['quantity']++;
        }

        foreach ($dishQuantities as $dish) {
            $orderItem = new OrderItem();
            $orderItem->setOrderId($order);
            $orderItem->setDishId($dish['dish']);
            $orderItem->setQuantity($dish['quantity']);

            $price = 0;             
            foreach($dishesPrice as $dishPrice){
                if($dish['dish']->getId() === $dishPrice->id){
                    $price = $dishPrice->currentPrice;
                    break;
                }
            }
            $orderItem->setPriceAtOrder($price);

            $this->em->persist($orderItem);
        }
    }


    public function isOrderValid($items): bool{
        $isValid = true;
        $dishes = [];
        foreach ($items as $item) {
            $itemId = $item['dish']['id'];
            if(!$itemId) $isValid = false;
            array_push($dishes,$this->dishRepository->find($itemId));
            if($item['quantity'] < 1 || $item['quantity'] > $this->orderDishMaxQuantity) $isValid = false;
        }
        $firstFoodPlaceId  = $dishes[0]->getFoodPlaceId()->getId();
        foreach ($dishes as $dish) {
            if (!$dish->isAvailable() 
                || $dish->getFoodPlaceId()->getId() !== $firstFoodPlaceId)
                $isValid = false;

        }   
        return $isValid;
    }

    public function assertOrderIsValid($items): void{
        $isValid = true;
        $dishes = [];
        foreach ($items as $item) {
            $itemId = $item['dish']['id'];
            if(!$itemId) $isValid = false;
            array_push($dishes,$this->dishRepository->find($itemId));
            if($item['quantity'] < 1 || $item['quantity'] > $this->orderDishMaxQuantity) $isValid = false;
        }
        $firstFoodPlaceId  = $dishes[0]->getFoodPlaceId()->getId();
        foreach ($dishes as $dish) {
            if (!$dish->isAvailable() 
                || $dish->getFoodPlaceId()->getId() !== $firstFoodPlaceId)
                $isValid = false;

        }   
        if(!$isValid) throw new InvalidOrderException();
    }

    public function validateOrder($order): void{
        $order->setStatus('PAID');
        $this->em->persist($order);
        $this->em->flush();
    }

    public function getOrdersFromUser($userDefault, $sessionId): array{
        $ordersDefault = $this->orderRepository->findBy(array('user_session_id' => $userDefault->getSessionId()));
        $orders = $this->orderRepository->findBy(array('user_session_id' => $sessionId));
        $allOrders = array_merge($ordersDefault, $orders);
        return $allOrders;
    }

    public function getOrderTime($sessionId){
        $user = $this->userRepository->findOneBy(array('session_id' => $sessionId));
        $timeCreatedUser = $user->getCreatedAt();
        $now = new DateTimeImmutable();
        $difference = $timeCreatedUser->diff($now);
        $util = $this->utilsRepository->findOneBy(array('name' => 'timeFront'));
        $timeFrontDefaultText = $util->getValue();
        $timeFrontDefault = new DateTimeImmutable($timeFrontDefaultText);
        $orderTime = $timeFrontDefault->add($difference);
        return $orderTime;
    }


}