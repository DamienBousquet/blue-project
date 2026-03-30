<?php
namespace App\UseCase;

use App\Service\RestaurantOfTheDayService;
use App\Repository\FoodPlaceRepository;
use App\Repository\DishRepository;
use App\Serializer\DishSerializer;
use App\Serializer\FoodPlaceSerializer;

class GetRestaurantOfTheDayData
{
    public function __construct(
        private RestaurantOfTheDayService $restaurantOfTheDayService,
        private FoodPlaceRepository $foodPlaceRepository,
        private DishRepository $dishRepository,
        private DishSerializer $dishSerializer,
        private FoodPlaceSerializer $foodPlaceSerializer
    ) {}

    public function execute(): ?array
    {
        $id = $this->restaurantOfTheDayService->getIdRestaurantOfTheDay();

        if ($id === null) {
            return null;
        }

        $foodPlace = $this->foodPlaceRepository->find($id);
        $result = $this->foodPlaceSerializer->serialize($foodPlace);

        $bestDishes = $this->dishRepository->findShownDishesFromPlace($id);
        $dishes = $this->dishSerializer->serializeCollection($bestDishes);

        if (count($dishes) >= 1) {
            $result['firstDish'] = $dishes[0];
        }

        if (count($dishes) >= 2) {
            $result['secondDish'] = $dishes[1];
        }

        return $result;
    }
}