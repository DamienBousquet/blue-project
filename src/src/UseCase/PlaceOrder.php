<?php
namespace App\UseCase;

use App\Repository\WalletRepository;
use App\Repository\OrderRepository;
use App\Repository\UtilsRepository;
use App\Service\OrderService;
use App\Service\DishService;
use App\Service\WalletService;
use App\Entity\User;
use App\Exception\ActiveOrderExistsException;

class PlaceOrder
{
    public function __construct(
        private OrderService $orderService,
        private DishService $dishService,
        private WalletService $walletService,
        private WalletRepository $walletRepository,
        private OrderRepository $orderRepository,
        private UtilsRepository $utilsRepository
    ) {}

    public function execute(User $user, array $dishesRaw, $sessionId): int
    {
        $this->orderService->assertOrderIsValid($dishesRaw);

        $dishes = $this->dishService->hydrateDishes($dishesRaw);

        $this->assertNoActiveOrder($sessionId);

        $totalPrice = $this->dishService->getTotalPrice($dishes, $this->utilsRepository->getDeliveryFee()->getValue());

        $dishesPrice = $this->dishService->getDishesCurrentPrice($dishes);

        $wallet = $this->walletRepository->findOneBy(array('user_session_id' => $sessionId));
        $this->walletService->assertSufficientFunds($wallet, $totalPrice);


        $order = $this->orderService->create(
            $sessionId,
            $totalPrice,
            $dishes,
            $dishesPrice
        );

        //simulate the foodplace answering the order, then proceed to remove the money from the wallet
        sleep(5);
        $this->orderService->validateOrder($order);
        $this->walletService->createTransaction(
                $wallet,
                $totalPrice,
                "debit",
                'Order #' . $order->getId()
            );

        return $order->getId();
    }

    private function assertNoActiveOrder($sessionId)
    {
        $latest = $this->orderRepository->findLatestOrderFromUser($sessionId);

        if ($latest && $latest->getStatus() !== 'DONE') {
            throw new ActiveOrderExistsException();
        }
    }
}