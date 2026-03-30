<?php
namespace App\Controller;

use App\Repository\FoodPlaceRepository;
use App\Repository\DishRepository;
use App\Repository\UtilsRepository;
use App\Repository\WalletRepository;
use App\Repository\UserRepository;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Service\RestaurantOfTheDayService;
use App\Service\OrderService;
use App\UseCase\PlaceOrder;
use App\UseCase\GetRestaurantOfTheDayData;
use App\Serializer\DishSerializer;
use App\Serializer\FoodPlaceSerializer;
use App\Serializer\OrderSerializer;
use App\Serializer\UserSerializer;
use App\UseCase\DeliveryPersonBehavior;
use App\UseCase\GetDeliveryPath;
use App\UseCase\SearchRestaurants;
use App\UseCase\GetEstimatedTimesDelivery;
use App\UseCase\GetCurrentDelivery;
use App\UseCase\ManageMercureCookie;
use App\UseCase\GetDeliveryStatus;

class DMFController extends AbstractController{

    #[Route('/api/dmf/user', name: 'getUserInformations', methods: ['GET', 'HEAD'])]
    public function getUserInformations(Request $request, UserRepository $userRepository, UserSerializer $userSerializer): JsonResponse{
        $session = $request->getSession();
        $user = $userRepository->findOneBy(array('session_id' => $session->getId()));
        $json = $userSerializer->serialize($user);
        return new JsonResponse($json);
    }

    #[Route('/api/dmf/places', name: 'places', methods: ['GET', 'HEAD'])]
    public function getAllPlaces(FoodPlaceRepository $repository, FoodPlaceSerializer $foodPlaceSerializer): JsonResponse{
        $places = $repository->findAll();
        $json = $foodPlaceSerializer->serializeCollection($places);
        return new JsonResponse($json);
    }

    #[Route('/api/dmf/place', name: 'place', methods: ['GET', 'HEAD'])]
    public function getSpecificFoodPlace(Request $request, FoodPlaceRepository $repository, FoodPlaceSerializer $foodPlaceSerializer): JsonResponse{
        $idFoodPlace = (int) $request->query->get('idFoodPlace');
        if(!is_integer($idFoodPlace)) return new JsonResponse([]);
        $place = $repository->find($idFoodPlace);
        $places = $place ? [$place] : [];
        $json = $foodPlaceSerializer->serializeCollection($places);
        return new JsonResponse($json);
    }

    #[Route('/api/dmf/placeAllDish', name: 'placeAllDish', methods: ['GET', 'HEAD'])]
    public function getPlaceAllDish(Request $request, DishRepository $repository, DishSerializer $dishSerializer,RestaurantOfTheDayService $restaurantOfTheDayService): JsonResponse{
        $idFoodPlace = $request->query->get('idFoodPlace');
        $allDish = $repository->findAllDishFromPlace($idFoodPlace);
        if(!$allDish) return new JsonResponse(`{}`);
        $json = $dishSerializer->serializeCollection($allDish,$restaurantOfTheDayService->getIdRestaurantOfTheDay(),$restaurantOfTheDayService->getReduction());
        return new JsonResponse($json);
    }

    #[Route('/api/dmf/dayFoodPlace', name: 'dayFoodPlace', methods: ['GET', 'HEAD'])]
    public function getDayFoodPlace(GetRestaurantOfTheDayData $getRestaurantOfTheDayData): JsonResponse{
        $json = $getRestaurantOfTheDayData->execute();
        return new JsonResponse($json);
    }

    #[Route('/api/dmf/estimatedTimesDelivery', name: 'estimatedTimesDelivery', methods: ['GET', 'HEAD'])]
    public function getEstimatedTimesDelivery(Request $request, GetEstimatedTimesDelivery $getEstimatedTimesDelivery): JsonResponse{
        $session = $request->getSession();
        if($session->getId() == null ) return new JsonResponse([]);
        $foodPlaceText = $request->query->get('foodPlaceText');
        $estimatedTimes = $getEstimatedTimesDelivery->execute($session->getId(), $foodPlaceText);
        return new JsonResponse($estimatedTimes);
    }

    #[Route('/api/dmf/restaurantsSearch', name: 'restaurantsSearch', methods: ['GET', 'HEAD'])]
    public function getRestaurantsSearch(Request $request, SearchRestaurants $searchRestaurants): JsonResponse{
        $query = $request->query->get('query');
        if(strlen($query) == 0 || strlen($query) > 35) return new JsonResponse([]);
        $data = $searchRestaurants->execute($query);
        return new JsonResponse($data);
    }

    #[Route('/api/dmf/orders',name: 'getUserOrders', methods: ["GET"])]
    public function getUserOrders(Request $request,OrderService $orderService, OrderSerializer $orderSerializer): JsonResponse{
        $user = $this->getUser();
        $session = $request->getSession();
        $orders = $orderService->getOrdersFromUser($user,$session->getId());
        $orders = $orderSerializer->serializeCollection($orders);
        return new JsonResponse($orders);
    }

    #[Route('/api/dmf/order',name: 'orderCreate', methods: ["POST"])]
    public function orderCreate(Request $request, PlaceOrder $placeOrder): JsonResponse{        
        $user = $this->getUser();
        $session = $request->getSession();
        $data = json_decode($request->getContent(), true);
        $orderId = $placeOrder->execute(
            $user,
            $data['dishes'],
            $session->getId()
        );
        return new JsonResponse(
            ["Votre commande n°". $orderId ." a été validée par le restaurant, pour voir son suivi, veuillez vous rendre sur votre profil."]
            , 201);
    }

    #[Route('/api/dmf/deliveryFee', name:'getDeliveryFee', methods:["GET"])]
    public function getDeliveryFee(UtilsRepository $utilsRepository): JsonResponse{
        $deliveryFee = $utilsRepository->getDeliveryFee();
        return new JsonResponse((float)$deliveryFee->getValue());
    }

    #[Route('/api/dmf/balance', name: 'getBalance',methods:["GET"])]
    public function getBalance(Request $request, WalletRepository $walletRepository): JsonResponse{
        $session = $request->getSession();
        $wallet = $walletRepository->findOneBy(['user_session_id' => $session->getId()]);
        $currentBalance = $wallet->getBalance();
        return new JsonResponse($currentBalance);
    }

    #[Route('/api/dmf/currentDelivery', name: 'getCurrentDelivery',methods:["GET"])]
    public function getCurrentDelivery(Request $request, GetCurrentDelivery $getCurrentDelivery): JsonResponse{
        $session = $request->getSession();
        $data = $getCurrentDelivery->execute($session->getId());
        return new JsonResponse($data);
    }

    #[Route('/api/dmf/deliveryPath', name: 'getDeliveryPath',methods:["GET"])]
    public function getDeliveryPath(Request $request, GetDeliveryPath $getDeliveryPath ): JsonResponse{
        $dataLink = $request->query->get('link');    
        $dataLinkArray = explode('/', $dataLink);
        $link = $dataLinkArray[1];
        $points = $getDeliveryPath->execute($link);
        return new JsonResponse($points);
        
    }

    #[Route('/api/dmf/mercureCookie', name: 'getMercureCookie', methods:["POST"])]
    public function getMercureCookie(Request $request, ManageMercureCookie $manageCookieService): JsonResponse{
        $response = $manageCookieService->execute($request);
        return $response;
    }

    #[Route('/api/dmf/deliveryStatus', name: 'getDeliveryStatus', methods:["GET"])]
    public function getDeliveryStatus(Request $request, GetDeliveryStatus $getDeliveryStatus): JsonResponse{
        $data = $getDeliveryStatus->execute($request);
        return new JsonResponse($data);
    }

}