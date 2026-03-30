<?php
namespace App\Service;

use App\Repository\FoodPlaceRepository;
use DateTime;

class RestaurantOfTheDayService
{
    private FoodPlaceRepository $foodPlaceRepository;
    private float $reduction = 0.9;

    public function __construct(FoodPlaceRepository $foodPlaceRepository)
    {
        $this->foodPlaceRepository = $foodPlaceRepository;
    }

    public function getIdRestaurantOfTheDay(): ?int
    {
        $today = (new DateTime())->format('Ymd');
        $restaurants = $this->foodPlaceRepository->findAll();
        $count = count($restaurants);

        if ($count === 0) {
            return null;
        }

        mt_srand((int) $today);
        $index = mt_rand(0, $count - 1);

        return $restaurants[$index]->getId();
    }

    public function getReduction(): float{
        return $this->reduction;
    }
}
