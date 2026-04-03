<?php
namespace App\Tests\Integration\UseCase;

use App\UseCase\SearchRestaurants;
use App\Repository\FoodPlaceRepository;
use App\Serializer\FoodPlaceSerializer;
use App\Entity\FoodPlace;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use PHPUnit\Framework\Attributes\Test;
use DateTimeImmutable;

class SearchRestaurantsIntegrationTest extends KernelTestCase
{
    private SearchRestaurants $searchRestaurants;
    private FoodPlaceRepository $foodPlaceRepository;
    private FoodPlaceSerializer $foodPlaceSerializer;

    protected function setUp(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $this->foodPlaceRepository = $container->get(FoodPlaceRepository::class);
        $this->foodPlaceSerializer = $container->get(FoodPlaceSerializer::class);

        $this->searchRestaurants = new SearchRestaurants(
            $this->foodPlaceRepository,
            $this->foodPlaceSerializer
        );
    }

    #[Test]
    public function testExecuteWithEmptyQueryReturnsEmptyArray()
    {
        $result = $this->searchRestaurants->execute('');
        $this->assertEquals([], $result);
    }

    #[Test]
    public function testExecuteWithOnlyWhitespaceQueryReturnsEmptyArray()
    {
        $result = $this->searchRestaurants->execute('   ');
        $this->assertEquals([], $result);
    }

    #[Test]
    public function testExecuteWithSingleShortTagReturnsEmptyArray()
    {
        $result = $this->searchRestaurants->execute('a');
        $this->assertEquals([], $result);
    }

    #[Test]
    public function testExecuteWithValidTagsCallsRepositoryAndSerializer()
    {
        $this->insertTestFoodPlaces();

        $query = 'pizza, italian';
        $result = $this->searchRestaurants->execute($query);

        $this->assertNotEmpty($result);
        $this->assertCount(2, $result);
        $this->assertEquals('Pizza Place', $result[0]['name']);
        $this->assertEquals('Italian Restaurant', $result[1]['name']);
        
        $this->removeTestData();
    }

    #[Test]
    public function testExecuteWithMixedValidAndInvalidTags()
    {
        $this->insertTestFoodPlaces();

        $query = 'pizza, a, italian, b';
        $result = $this->searchRestaurants->execute($query);

        $this->assertNotEmpty($result);
        $this->assertCount(2, $result);
        $this->assertEquals('Pizza Place', $result[0]['name']);
        $this->assertEquals('Italian Restaurant', $result[1]['name']);

        $this->removeTestData();
    }

    private function insertTestFoodPlaces(): void
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();

        $pizzaPlace = new FoodPlace();
        $pizzaPlace->setName('Pizza Place');
        $pizzaPlace->setTags('pizza, fast food');
        $pizzaPlace->setRatingAvg('4.5');
        $pizzaPlace->setLatitude('48.8566');
        $pizzaPlace->setLongitude('2.3522');
        $pizzaPlace->setIsOpen(true);
        $pizzaPlace->setCreatedAt(new DateTimeImmutable());

        $italianRestaurant = new FoodPlace();
        $italianRestaurant->setName('Italian Restaurant');
        $italianRestaurant->setTags('italian, pasta');
        $italianRestaurant->setRatingAvg('4.7');
        $italianRestaurant->setLatitude('48.8566');
        $italianRestaurant->setLongitude('2.3522');
        $italianRestaurant->setIsOpen(true);
        $italianRestaurant->setCreatedAt(new DateTimeImmutable());

        $entityManager->persist($pizzaPlace);
        $entityManager->persist($italianRestaurant);
        $entityManager->flush();
    }

    protected function removeTestData(): void
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $places = $this->foodPlaceRepository->findAll();
        foreach ($places as $place) {
            $entityManager->remove($place);
        }
        $entityManager->flush();
    }
}