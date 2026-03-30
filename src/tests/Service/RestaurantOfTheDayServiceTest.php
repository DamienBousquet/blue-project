<?php
namespace App\Tests\Service;

use App\Service\RestaurantOfTheDayService;
use App\Repository\FoodPlaceRepository;
use App\Entity\FoodPlace;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\Test;
use DateTime;

class RestaurantOfTheDayServiceTest extends TestCase
{
    #[Test]
    public function testGetIdRestaurantOfTheDayReturnsNullWhenNoRestaurants()
    {
        $repository = $this->createMock(FoodPlaceRepository::class);
        $repository->method('findAll')->willReturn([]);

        $service = new RestaurantOfTheDayService($repository);
        $result = $service->getIdRestaurantOfTheDay();

        $this->assertNull($result);
    }

    #[Test]
    public function testGetIdRestaurantOfTheDayReturnsIdWhenRestaurantsExist()
    {
        $restaurant = $this->createMock(FoodPlace::class);
        $restaurant->method('getId')->willReturn(1);

        $repository = $this->createMock(FoodPlaceRepository::class);
        $repository->method('findAll')->willReturn([$restaurant]);

        $service = new RestaurantOfTheDayService($repository);
        $result = $service->getIdRestaurantOfTheDay();

        $this->assertEquals(1, $result);
    }

    #[Test]
    public function testGetIdRestaurantOfTheDayIsDeterministicForSameDay()
    {
        $restaurant1 = $this->createMock(FoodPlace::class);
        $restaurant1->method('getId')->willReturn(1);
        $restaurant2 = $this->createMock(FoodPlace::class);
        $restaurant2->method('getId')->willReturn(2);

        $repository = $this->createMock(FoodPlaceRepository::class);
        $repository->method('findAll')->willReturn([$restaurant1, $restaurant2]);

        $service = new RestaurantOfTheDayService($repository);

        $today = '20260324';
        $originalDateTime = DateTime::class;
        $mockDateTime = $this->getMockBuilder(DateTime::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['format'])
            ->getMock();
        $mockDateTime->method('format')->willReturn($today);

        $result1 = $service->getIdRestaurantOfTheDay();
        $result2 = $service->getIdRestaurantOfTheDay();

        $this->assertEquals($result1, $result2);
    }

    #[Test]
    public function testGetReductionReturnsCorrectValue()
    {
        $repository = $this->createMock(FoodPlaceRepository::class);
        $service = new RestaurantOfTheDayService($repository);

        $this->assertEquals(0.9, $service->getReduction());
    }


}
