<?php
namespace App\Tests\Integration\Service;

use App\Entity\FoodPlace;
use App\Repository\FoodPlaceRepository;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use PHPUnit\Framework\Attributes\Test;
use DateTimeImmutable;
use App\Service\RestaurantOfTheDayService;

class RestaurantOfTheDayServiceIntegrationTest extends KernelTestCase{

    private RestaurantOfTheDayService $restaurantOfTheDayService;
    private FoodPlaceRepository $foodPlaceRepository;

    protected function setUp(): void
    {
        self::bootKernel();
        $container = static::getContainer();
        // $this->restaurantOfTheDayService = $container->get(RestaurantOfTheDayService::class);
        $this->foodPlaceRepository = $container->get('doctrine')->getRepository(FoodPlace::class);
        $this->restaurantOfTheDayService = new RestaurantOfTheDayService($this->foodPlaceRepository);
    }

    #[Test]
    public function testRestaurantOfTheDayServiceReturnValue(): void
    {
        $foodPlace = $this->insertTestFoodPlace();

        $result = $this->restaurantOfTheDayService->getIdRestaurantOfTheDay();

        $this->assertEquals($foodPlace->getId(), $result);
    }

    #[Test]
    public function testRestaurantOfTheDayServiceReturnNull(): void
    {

        $result = $this->restaurantOfTheDayService->getIdRestaurantOfTheDay();

        $this->assertEquals(null, $result);
    }

    #[Test]
    public function testGetIdRestaurantOfTheDayIsDeterministicForSameDay(): void
    {
        $this->insertTestFoodPlaces();

        $result1 =  $this->restaurantOfTheDayService->getIdRestaurantOfTheDay();
        $result2 =  $this->restaurantOfTheDayService->getIdRestaurantOfTheDay();

        $this->assertEquals($result1, $result2);
    }

    private function insertTestFoodPlace(): FoodPlace
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $foodPlace = new FoodPlace();
        $foodPlace->setLongitude('2.3522');
        $foodPlace->setLatitude('48.8566');
        $foodPlace->setName('Test FoodPlace');
        $foodPlace->setRatingAvg('4.5');
        $foodPlace->setTags('tag1, tag2');
        $foodPlace->setIsOpen(true);
        $foodPlace->setCreatedAt(new DateTimeImmutable());
        $entityManager->persist($foodPlace);
        $entityManager->flush();
        return $foodPlace;
    }

    private function insertTestFoodPlaces(): FoodPlace
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $foodPlace = new FoodPlace();
        $foodPlace->setLongitude('2.3522');
        $foodPlace->setLatitude('48.8566');
        $foodPlace->setName('Test FoodPlace');
        $foodPlace->setRatingAvg('4.5');
        $foodPlace->setTags('tag1, tag2');
        $foodPlace->setIsOpen(true);
        $foodPlace->setCreatedAt(new DateTimeImmutable());

        $foodPlace2 = new FoodPlace();
        $foodPlace2->setLongitude('2.3522');
        $foodPlace2->setLatitude('48.8566');
        $foodPlace2->setName('Test FoodPlace2');
        $foodPlace2->setRatingAvg('4.3');
        $foodPlace2->setTags('tag1, tag2');
        $foodPlace2->setIsOpen(true);
        $foodPlace2->setCreatedAt(new DateTimeImmutable());

        $foodPlace3 = new FoodPlace();
        $foodPlace3->setLongitude('2.3522');
        $foodPlace3->setLatitude('48.8566');
        $foodPlace3->setName('Test FoodPlace3');
        $foodPlace3->setRatingAvg('4.3');
        $foodPlace3->setTags('tag1, tag2');
        $foodPlace3->setIsOpen(true);
        $foodPlace3->setCreatedAt(new DateTimeImmutable());

        $foodPlace4 = new FoodPlace();
        $foodPlace4->setLongitude('2.3522');
        $foodPlace4->setLatitude('48.8566');
        $foodPlace4->setName('Test FoodPlace4');
        $foodPlace4->setRatingAvg('4.1');
        $foodPlace4->setTags('tag1, tag2');
        $foodPlace4->setIsOpen(true);
        $foodPlace4->setCreatedAt(new DateTimeImmutable());

        $entityManager->persist($foodPlace);
        $entityManager->persist($foodPlace2);
        $entityManager->persist($foodPlace3);
        $entityManager->persist($foodPlace4);
        $entityManager->flush();
        return $foodPlace;
    }

    protected function tearDown(): void
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $foodPlaces = $entityManager->getRepository(FoodPlace::class)->findAll();
        foreach ($foodPlaces as $foodPlace) {
            $entityManager->remove($foodPlace);
        }
        $entityManager->flush();
    }

}