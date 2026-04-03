<?php
namespace App\Tests\Unit\UseCase;

use App\Entity\Dish;
use App\UseCase\GetRestaurantOfTheDayData;
use App\Service\RestaurantOfTheDayService;
use App\Repository\FoodPlaceRepository;
use App\Repository\DishRepository;
use App\Serializer\DishSerializer;
use App\Serializer\FoodPlaceSerializer;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\Test;
use App\Entity\FoodPlace;
use DateTimeImmutable;

/* 
    this use case is hard to test because there is no input
*/
class GetRestaurantOfTheDayDataTest extends TestCase
{
    private $restaurantOfTheDayService;
    private $foodPlaceRepository;
    private $dishRepository;
    private $dishSerializer;
    private $foodPlaceSerializer;
    private $getRestaurantOfTheDayData;

    protected function setUp(): void
    {
        $this->restaurantOfTheDayService = $this->createMock(RestaurantOfTheDayService::class);
        $this->foodPlaceRepository = $this->createMock(FoodPlaceRepository::class);
        $this->dishRepository = $this->createMock(DishRepository::class);
        $this->dishSerializer = $this->createMock(DishSerializer::class);
        $this->foodPlaceSerializer = $this->createMock(FoodPlaceSerializer::class);

        $this->getRestaurantOfTheDayData = new GetRestaurantOfTheDayData(
            $this->restaurantOfTheDayService,
            $this->foodPlaceRepository,
            $this->dishRepository,
            $this->dishSerializer,
            $this->foodPlaceSerializer
        );
    }

    #[Test]
    public function testReturnsSerializedRestaurantWithDishes()
    {
        $foodPlace = new FoodPlace();
        $foodPlace->setName('Chez Laurent');
        $foodPlace->setRatingAvg("4.7");
        $foodPlace->setIcon('burger');
        $foodPlace->setLatitude('4');
        $foodPlace->setLongitude('5');
        $foodPlace->setIsOpen(true);
        $foodPlace->setTags("burger, frites");
        $foodPlace->setCreatedAt(new DateTimeImmutable());

        $dish = new Dish();
        $dish->setFoodPlaceId($foodPlace);
        $dish->setIsAvailable(true);
        $dish->setName('plat1');
        $dish->setPrice("5.00");
        $dish->setIsShown(false);
        $dish->setDescription('');

        $secondDish = new Dish();
        $secondDish->setFoodPlaceId($foodPlace);
        $secondDish->setIsAvailable(true);
        $secondDish->setName('plat2');
        $secondDish->setPrice("7.00");
        $secondDish->setIsShown(true);
        $secondDish->setDescription('');

        $serializedRestaurant = ['name' => 'Chez Laurent'];
        $serializedDishes = [
            ['name' => 'plat1'], 
            ['name' => 'plat2']
        ];
        $expected = ['name' => 'Chez Laurent',
            'firstDish' => ['name' => 'plat1'],
            'secondDish' => ['name' => 'plat2']
        ];
        
        $this->restaurantOfTheDayService->expects($this->once())
            ->method('getIdRestaurantOfTheDay')
            ->willReturn(1);

        $this->foodPlaceRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($foodPlace);

        $this->foodPlaceSerializer->expects($this->once())
            ->method('serialize')
            ->with($foodPlace)
            ->willReturn($serializedRestaurant);

        $this->dishRepository->expects($this->once())
            ->method('findShownDishesFromPlace')
            ->with(1)
            ->willReturn([$dish, $secondDish]);

        $this->dishSerializer->expects($this->once())
            ->method('serializeCollection')
            ->with([$dish, $secondDish])
            ->willReturn($serializedDishes);

        $result = $this->getRestaurantOfTheDayData->execute();
        $this->assertEquals($expected, $result);
    }

    #[Test]
    public function testReturnsRestaurantWithoutDishesWhenNoDishesAvailable()
    {
        $foodPlace = new FoodPlace();
        $foodPlace->setName('Chez Laurent');

        $this->restaurantOfTheDayService->expects($this->once())
            ->method('getIdRestaurantOfTheDay')
            ->willReturn(1);

        $this->foodPlaceRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($foodPlace);

        $this->foodPlaceSerializer->expects($this->once())
            ->method('serialize')
            ->with($foodPlace)
            ->willReturn(['name' => 'Chez Laurent']);

        $this->dishRepository->expects($this->once())
            ->method('findShownDishesFromPlace')
            ->with(1)
            ->willReturn([]);

        $result = $this->getRestaurantOfTheDayData->execute();
        $this->assertArrayNotHasKey('firstDish', $result);
        $this->assertArrayNotHasKey('secondDish', $result);
    }
}
