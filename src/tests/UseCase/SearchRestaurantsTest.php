<?php
namespace App\Tests\UseCase;

use App\UseCase\SearchRestaurants;
use App\Repository\FoodPlaceRepository;
use App\Serializer\FoodPlaceSerializer;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\Test;

class SearchRestaurantsTest extends TestCase
{
    private $foodPlaceRepository;
    private $foodPlaceSerializer;
    private $searchRestaurants;

    protected function setUp(): void
    {
        $this->foodPlaceRepository = $this->createMock(FoodPlaceRepository::class);
        $this->foodPlaceSerializer = $this->createMock(FoodPlaceSerializer::class);
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
        $query = 'pizza, italian';
        $tags = ['pizza', 'italian'];
        $places = ['place1', 'place2'];
        $serialized = ['serialized1', 'serialized2'];

        $this->foodPlaceRepository->expects($this->once())
            ->method('findFoodPlaceFromTagsOrName')
            ->with($tags)
            ->willReturn($places);

        $this->foodPlaceSerializer->expects($this->once())
            ->method('serializeCollection')
            ->with($places)
            ->willReturn($serialized);

        $result = $this->searchRestaurants->execute($query);
        $this->assertEquals($serialized, $result);
    }

    #[Test]
    public function testExecuteWithMixedValidAndInvalidTags()
    {
        $query = 'pizza, a, italian, b';
        $tags = ['pizza', 'italian'];
        $places = ['place1'];
        $serialized = ['serialized1'];

        $this->foodPlaceRepository->expects($this->once())
            ->method('findFoodPlaceFromTagsOrName')
            ->with($tags)
            ->willReturn($places);

        $this->foodPlaceSerializer->expects($this->once())
            ->method('serializeCollection')
            ->with($places)
            ->willReturn($serialized);

        $result = $this->searchRestaurants->execute($query);
        $this->assertEquals($serialized, $result);
    }
}
