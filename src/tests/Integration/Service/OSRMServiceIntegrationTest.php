<?php
namespace App\Tests\Integration\Service;

use App\Service\OSRMService;
use App\Entity\FoodPlace;
use App\Entity\DeliveryPerson;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use PHPUnit\Framework\Attributes\Test;
use DateTimeImmutable;
use ReflectionClass;

class OSRMServiceIntegrationTest extends KernelTestCase
{
    private OSRMService $osrmService;

    protected function setUp(): void
    {
        self::bootKernel();
        $container = static::getContainer();
        $this->osrmService = $container->get(OSRMService::class);
    }

    #[Test]
    public function testGetNearestAvailableDeliveryPersonReturnsCorrectPerson()
    {
        $reflection = new ReflectionClass(OSRMService::class);
        $property = $reflection->getProperty('arrayDeliveryPerson');
        $property->setValue($this->osrmService, [
            new DeliveryPerson(1, 3.901992, 43.561168, false),
            new DeliveryPerson(2, 3.912517, 43.570014, false),
        ]);

        $foodPlace = $this->insertTestFoodPlace(3.902126, 43.560456);

        $result = $this->osrmService->getNearestAvailableDeliveryPerson($foodPlace);

        $this->assertNotNull($result);
        $this->assertEquals(1, $result->getId());
    }

    
    #[Test]
    public function testGetNearestAvailableDeliveryPersonReturnsCorrectAvailablePerson()
    {
        $reflection = new ReflectionClass(OSRMService::class);
        $property = $reflection->getProperty('arrayDeliveryPerson');
        $property->setValue($this->osrmService, [
            new DeliveryPerson(1, 3.901992, 43.561168, true),
            new DeliveryPerson(2, 3.912517, 43.570014, false),
        ]);

        $foodPlace = $this->insertTestFoodPlace(3.902126, 43.560456);

        $result = $this->osrmService->getNearestAvailableDeliveryPerson($foodPlace);

        $this->assertNotNull($result);
        $this->assertEquals(2, $result->getId());
    }


    #[Test]
    public function testGetEstimatedTimesFromFoodPlaceReturnsEmptyArrayWhenNoFoodPlaces()
    {
        $user = $this->insertTestUser(3.928817, 43.58832);

        $result = $this->osrmService->getEstimatedTimesFromFoodPlace($user, []);

        $this->assertEmpty($result);
    }

    #[Test]
    public function testGetEstimatedTimesFromFoodPlaceReturnsValue()
    {
        $user = $this->insertTestUser(3.928817, 43.58832);
        $foodPlace = $this->insertTestFoodPlace(3.902126, 43.560456);

        $result = $this->osrmService->getEstimatedTimesFromFoodPlace($user, [$foodPlace]);

        $this->assertArrayHasKey('id', $result[0]);
        $this->assertArrayHasKey('timeDelivery', $result[0]);
    }

    private function insertTestFoodPlace(float $longitude, float $latitude, ?int $id = null): FoodPlace
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $foodPlace = new FoodPlace();
        if ($id) {
            $reflection = new ReflectionClass($foodPlace);
            $property = $reflection->getProperty('id');
            $property->setValue($foodPlace, $id);
        }
        $foodPlace->setLongitude($longitude);
        $foodPlace->setLatitude($latitude);
        $foodPlace->setName('Test FoodPlace');
        $foodPlace->setRatingAvg('4.5');
        $foodPlace->setTags('tag1, tag2');
        $foodPlace->setIsOpen(true);
        $foodPlace->setCreatedAt(new DateTimeImmutable());
        $entityManager->persist($foodPlace);
        $entityManager->flush();
        return $foodPlace;
    }

    private function insertTestUser(float $longitude, float $latitude): User
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $user = new User();
        $user->setLongitude($longitude);
        $user->setLatitude($latitude);
        $user->setName('Test User');
        $user->setEmail('test@mail.com');
        $user->setPasswordHash('password');
        $user->setCreatedAt(new DateTimeImmutable());
        $user->setSessionId('test_session');
        $entityManager->persist($user);
        $entityManager->flush();
        return $user;
    }


    protected function tearDown(): void
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $foodPlaces = $entityManager->getRepository(FoodPlace::class)->findAll();
        foreach ($foodPlaces as $foodPlace) {
            $entityManager->remove($foodPlace);
        }
        $users = $entityManager->getRepository(User::class)->findAll();
        foreach ($users as $user) {
            $entityManager->remove($user);
        }
        $entityManager->flush();
    }
}