<?php
namespace App\Serializer;

use App\Entity\FoodPlace;

class FoodPlaceSerializer
{

    public function serialize(
        FoodPlace $foodPlace,
    ): array {

        return [
            'id' => $foodPlace->getId(),
            'name' => $foodPlace->getName(),
            'tags' => $foodPlace->getTags(),
            'icon' => $foodPlace->getIcon(),
            'ratingAvg' => (float)$foodPlace->getRatingAvg(),
            'latitude' => $foodPlace->getLatitude(),
            'longitude' => $foodPlace->getLongitude(),
            'isOpen' => $foodPlace->isOpen()
        ];
    }


    public function serializeCollection(array $foodPlaces): array
    {
        return array_map(
            fn(FoodPlace $foodPlace) => $this->serialize($foodPlace),
            $foodPlaces
        );
    }
}