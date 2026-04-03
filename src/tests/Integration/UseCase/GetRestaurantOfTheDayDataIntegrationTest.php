<?php
namespace App\Tests\Integration\UseCase;

use App\UseCase\GetRestaurantOfTheDayData;
use App\Service\RestaurantOfTheDayService;
use App\Repository\FoodPlaceRepository;
use App\Repository\DishRepository;
use App\Serializer\DishSerializer;
use App\Entity\Dish;
use App\Entity\FoodPlace;
use App\Serializer\FoodPlaceSerializer;
use DateTimeImmutable;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use PHPUnit\Framework\Attributes\Test;

class GetRestaurantOfTheDayDataIntegrationTest extends KernelTestCase
{
    private GetRestaurantOfTheDayData $getRestaurantOfTheDayData;
    private FoodPlaceRepository $foodPlaceRepository;
    private DishRepository $dishRepository;

    protected function setUp(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $this->foodPlaceRepository = $container->get('doctrine')->getRepository(FoodPlace::class);
        $this->dishRepository = $container->get('doctrine')->getRepository(Dish::class);

        $restaurantOfTheDayService = $container->get(RestaurantOfTheDayService::class);
        $dishSerializer = $container->get(DishSerializer::class);
        $foodPlaceSerializer = $container->get(FoodPlaceSerializer::class);

        $this->getRestaurantOfTheDayData = new GetRestaurantOfTheDayData(
            $restaurantOfTheDayService,
            $this->foodPlaceRepository,
            $this->dishRepository,
            $dishSerializer,
            $foodPlaceSerializer
        );
    }

    #[Test]
    public function testReturnsSerializedRestaurantWithDishes()
    {
        $place = new FoodPlace();
        $place->setName('Pizza Place');
        $place->setTags('pizza, fast food');
        $place->setRatingAvg('4.5');
        $place->setLatitude('48.8566');
        $place->setLongitude('2.3522');
        $place->setIsOpen(true);
        $place->setCreatedAt(new DateTimeImmutable());

        $dish = new Dish();
        $dish->setFoodPlaceId($place);
        $dish->setIsAvailable(true);
        $dish->setName('plat1');
        $dish->setPrice("5.00");
        $dish->setIsShown(true);
        $dish->setDescription('');

        $secondDish = new Dish();
        $secondDish->setFoodPlaceId($place);
        $secondDish->setIsAvailable(true);
        $secondDish->setName('plat2');
        $secondDish->setPrice("7.00");
        $secondDish->setIsShown(true);
        $secondDish->setDescription('');

        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $entityManager->persist($place);
        $entityManager->persist($dish);
        $entityManager->persist($secondDish);
        $entityManager->flush();

        $result = $this->getRestaurantOfTheDayData->execute();
        $this->assertArrayHasKey('name', $result);
        $this->assertArrayHasKey('firstDish', $result);
        $this->assertArrayHasKey('secondDish', $result);
    }

    #[Test]
    public function testReturnsSerializedRestaurantWithOneDish()
    {
        $place = new FoodPlace();
        $place->setName('Pizza Place');
        $place->setTags('pizza, fast food');
        $place->setRatingAvg('4.5');
        $place->setLatitude('48.8566');
        $place->setLongitude('2.3522');
        $place->setIsOpen(true);
        $place->setCreatedAt(new DateTimeImmutable());

        $dish = new Dish();
        $dish->setFoodPlaceId($place);
        $dish->setIsAvailable(true);
        $dish->setName('plat1');
        $dish->setPrice("5.00");
        $dish->setIsShown(true);
        $dish->setDescription('');

        //this one is not supposed to be shown
        $secondDish = new Dish();
        $secondDish->setFoodPlaceId($place);
        $secondDish->setIsAvailable(false);
        $secondDish->setName('plat2');
        $secondDish->setPrice("7.00");
        $secondDish->setIsShown(false);
        $secondDish->setDescription('');

        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $entityManager->persist($place);
        $entityManager->persist($dish);
        $entityManager->persist($secondDish);
        $entityManager->flush();

        $result = $this->getRestaurantOfTheDayData->execute();
        $this->assertArrayHasKey('name', $result);
        $this->assertArrayHasKey('firstDish', $result);
        $this->assertArrayNotHasKey('secondDish', $result);

    }

    protected function tearDown(): void
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $places = $this->foodPlaceRepository->findAll();
        foreach ($places as $place) {
            $entityManager->remove($place);
        }
        $dishes = $this->dishRepository->findAll();
        foreach ($dishes as $dish) {
            $entityManager->remove($dish);
        }
        $entityManager->flush();
    }

}