<?php
namespace App\Tests\Service;

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\Test;
use App\Entity\FoodPlace;
use App\Service\OSRMService;
use DateTimeImmutable;
use App\Entity\DeliveryPerson;
use ReflectionClass;
use App\Entity\User;

class OSRMServiceTest extends TestCase
{
    #[Test]
    public function testGetNearestAvailableDeliveryPersonReturnsCorrectPerson()
    {
        $foodPlace = $this->createMock(FoodPlace::class);
        $foodPlace->method('getLongitude')->willReturn("3.928817");
        $foodPlace->method('getLatitude')->willReturn("43.58832");

        $osrmService = $this->getMockBuilder(OSRMService::class)
            ->onlyMethods(['sendRequestToOSRM'])
            ->getMock();

        $osrmService->method('sendRequestToOSRM')
            ->willReturn(['routes' => [['duration' => 120]]]);

        $result = $osrmService->getNearestAvailableDeliveryPerson($foodPlace);
        $this->assertEquals(1, $result->getId());
    }

    #[Test]
    public function testGetNearestAvailableDeliveryPersonReturnsNullWhenNoneAvailable()
    {
        $osrmService = $this->getMockBuilder(OSRMService::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['sendRequestToOSRM'])
            ->getMock();

        $reflection = new ReflectionClass(OSRMService::class);
        $property = $reflection->getProperty('arrayDeliveryPerson');
        $property->setValue($osrmService, [
            new DeliveryPerson(1, 3.928817, 43.58832, true),
            new DeliveryPerson(2, 3.912517, 43.570014, true),
        ]);

        $foodPlace = $this->createMock(FoodPlace::class);
        $foodPlace->method('getLongitude')->willReturn("3.928817");
        $foodPlace->method('getLatitude')->willReturn("43.58832");

        $result = $osrmService->getNearestAvailableDeliveryPerson($foodPlace);
        $this->assertNull($result);
    }

    #[Test]
    public function testGetEstimatedTimesFromFoodPlaceReturnsCorrectTimes()
    {
        $user = $this->createMock(User::class);
        $user->method('getLongitude')->willReturn("3.928817");
        $user->method('getLatitude')->willReturn("43.58832");

        $foodPlace1 = $this->createMock(FoodPlace::class);
        $foodPlace1->method('getId')->willReturn(1);
        $foodPlace1->method('getLongitude')->willReturn("3.928817");
        $foodPlace1->method('getLatitude')->willReturn("43.58832");

        $foodPlace2 = $this->createMock(FoodPlace::class);
        $foodPlace2->method('getId')->willReturn(2);
        $foodPlace2->method('getLongitude')->willReturn("3.912517");
        $foodPlace2->method('getLatitude')->willReturn("43.570014");

        $osrmService = $this->getMockBuilder(OSRMService::class)
            ->onlyMethods(['sendRequestToOSRM'])
            ->getMock();

        $osrmService->method('sendRequestToOSRM')
            ->willReturnOnConsecutiveCalls(
                ['routes' => [['duration' => 120]]],
                ['routes' => [['duration' => 180]]]
            );

        $result = $osrmService->getEstimatedTimesFromFoodPlace($user, [$foodPlace1, $foodPlace2]);
        $this->assertCount(2, $result);
        $this->assertEquals(1, $result[0]['id']);
        $this->assertEquals(120 + 4*60, $result[0]['timeDelivery']);
        $this->assertEquals(2, $result[1]['id']);
        $this->assertEquals(180 + 4*60, $result[1]['timeDelivery']);
    }
    
    #[Test]
    public function testGetEstimatedTimesFromFoodPlaceReturnsEmptyArrayWhenNoFoodPlaces()
    {
        $user = $this->createMock(User::class);
        $osrmService = new OSRMService();
        $result = $osrmService->getEstimatedTimesFromFoodPlace($user, []);
        $this->assertEmpty($result);
    }
}