<?php
namespace App\UseCase;

use App\Service\OSRMService;
use App\Service\RestaurantOfTheDayService;
use App\Repository\FoodPlaceRepository;
use App\Repository\UserRepository;

class GetEstimatedTimesDelivery{

    public function __construct(
        private OSRMService $OSRMService, 
        private RestaurantOfTheDayService $restaurantOfTheDayService,
        private FoodPlaceRepository $foodPlaceRepository,
        private UserRepository $userRepository
    ) {}

    /* 
        foodPlaceText :
            '-1' : DayFoodPlace
            int > '-1' : foodPlaceId
            '1,6,15...' : foodPlaceIds
            'all' : all foodPlace
    */
    public function execute($sessionId, $foodPlaceText){
        $user = $this->userRepository->findOneBy(array('session_id' => $sessionId));
        if($foodPlaceText == '-1'){
            $foodPlaceId = $this->restaurantOfTheDayService->getIdRestaurantOfTheDay();
            $foodPlaces[0] = $this->foodPlaceRepository->find($foodPlaceId);
        }else if($foodPlaceText == 'all'){
            $foodPlaces = $this->foodPlaceRepository->findAll();
        }else if(str_contains($foodPlaceText, ',')){
            $ids = explode(',', $foodPlaceText); 
            $ids = array_map('intval', $ids); 
            $foodPlaces = $this->foodPlaceRepository->findBy(['id' => $ids]);
        }
        else{
            $foodPlaceId = $foodPlaceText;
            $foodPlaces[0] = $this->foodPlaceRepository->find($foodPlaceId);
        }
        $estimatedTimes = $this->OSRMService->getEstimatedTimesFromFoodPlace($user, $foodPlaces);
        return $estimatedTimes;
    }

}