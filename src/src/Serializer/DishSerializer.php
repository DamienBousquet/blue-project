<?php
namespace App\Serializer;

use App\Entity\Dish;
use App\Service\PricingService;

class DishSerializer
{

    public function __construct(
        private PricingService $pricingService
    ) {}

    public function serialize(
        Dish $dish
    ): array {

    $pricing = $this->pricingService->getDishPricing($dish);
    return [
            'id' => $dish->getId(),
            'name' => $dish->getName(),
            'description' => $dish->getDescription(),
            'imagePath' => 'id-' . $dish->getFoodPlaceId()->getId() . '/' . $dish->getImagePath(),
            'price' => $pricing['price'],
            'newPrice' => $pricing['newPrice'],
            'isAvailable' => $dish->isAvailable(),
            'isShown' => $dish->isShown(),
        ];
    }

    public function serializeCollection(array $dishes, ?int $restaurantOfTheDayId = null, ?float $reduction = null): array
    {
        return array_map(
            fn(Dish $dish) => $this->serialize($dish, $restaurantOfTheDayId, $reduction),
            $dishes
        );
    }
}