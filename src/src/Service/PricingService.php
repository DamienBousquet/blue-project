<?php
namespace App\Service;

use App\Entity\Dish;

class PricingService
{
    public function __construct(
        private RestaurantOfTheDayService $restaurantOfTheDayService
    ) {}

    public function getDishPricing(Dish $dish): array
    {
        $basePrice = (float) $dish->getPrice();
        $restaurantId = $this->restaurantOfTheDayService->getIdRestaurantOfTheDay();

        if (
            $restaurantId !== null &&
            $dish->getFoodPlaceId()->getId() === $restaurantId
        ) {
            return [
                'price' => $basePrice,
                'newPrice' => $basePrice * $this->restaurantOfTheDayService->getReduction(),
            ];
        }

        return [
            'price' => $basePrice,
            'newPrice' => null,
        ];
    }
}