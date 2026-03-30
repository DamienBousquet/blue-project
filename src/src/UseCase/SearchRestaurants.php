<?php
namespace App\UseCase;

use App\Repository\FoodPlaceRepository;
use App\Serializer\FoodPlaceSerializer;

class SearchRestaurants{
       
    public function __construct(
        private FoodPlaceRepository $foodPlaceRepository,
        private FoodPlaceSerializer $foodPlaceSerializer,
    ) {}

    public function execute($query){
        $query = trim($query);
        if (empty($query)) {
            return [];
        }

        $tags = array_values(
            array_filter(
                array_map('trim', explode(',', $query)),
                fn($tag) => strlen($tag) > 1
            )
        );

        if (empty($tags)) {
            return [];
        }

        $places = $this->foodPlaceRepository->findFoodPlaceFromTagsOrName($tags);
        return $this->foodPlaceSerializer->serializeCollection($places);
    }
}