<?php
namespace App\Service;

use App\Repository\DishRepository;
use App\Service\PricingService;
use stdClass;

class DishService
{
    public function __construct(
        private DishRepository $dishRepository, 
        private PricingService $pricingService
    ){}

    public function hydrateDishes($items): array{
        $dishes = [];
        foreach ($items as $item) {
            $idDish = $item['dish']['id'];
            $quantity = $item['quantity'];
            for ($i=0; $i < $quantity ; $i++) {  
                array_push($dishes,$this->dishRepository->find($idDish));
            }
        }
        return $dishes;
    }

    public function getDishesCurrentPrice(array $dishes): array
    {
        $result = [];

        foreach ($dishes as $dish) {
            $dishId = $dish->getId();

            if (!isset($result[$dishId])) {
                ["price" => $price, "newPrice" => $newPrice] = $this->pricingService->getDishPricing($dish);
                $newPrice !== null ? $currentPrice = $newPrice : $currentPrice = $price;
                $result[$dishId] = (object)[
                    'id' => $dishId,
                    'currentPrice' => $currentPrice,
                ];
            }
        }

        return array_values($result);
    }

    public function getTotalPrice(array $dishes, float $deliveryFee): float
    {
        $total = 0;
        foreach ($dishes as $dish) {
            ['price' => $price, 'newPrice' => $newPrice] = $this->pricingService->getDishPricing($dish);
            $newPrice !== null ? $total += $newPrice : $total += $price;
        }

        return $total + $deliveryFee;
    }
}
