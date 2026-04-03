<?php
namespace App\Tests\Unit\UseCase;

use App\UseCase\GetWeather;
use App\Repository\UtilsRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Utils;
use DateTimeImmutable;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class GetWeatherTest extends TestCase
{
    private $utilsRepository;
    private $entityManager;
    private $getWeather;

    protected function setUp(): void
    {
        $this->utilsRepository = $this->createMock(UtilsRepository::class);
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->getWeather = new GetWeather($this->utilsRepository, $this->entityManager);
    }


    #[Test]
    public function testExecuteWithUpToDateData()
    {
        $util = new Utils();
        $util->setName('weather');
        $util->setValue('10||/weather-icons/sunny.png');
        $util->setCreatedAt(new DateTimeImmutable());

        $this->utilsRepository->method('findOneBy')
            ->willReturn($util);

        $result = $this->getWeather->execute();

        $this->assertEquals(['place' => 'Lattes', 'temperature' => '10', 'imageUrl' => '/weather-icons/sunny.png'], $result);
    }

    #[Test]
    public function testExecuteWithOutdatedData()
    {
        $util = new Utils();
        $util->setName('weather');
        $util->setValue('200||/weather-icons/sunny.png');
        $util->setCreatedAt((new DateTimeImmutable())->modify('-310 minutes'));

        $this->utilsRepository->method('findOneBy')
            ->willReturn($util);

        $result = $this->getWeather->execute();

        $this->assertNotEquals(['place' => 'Lattes', 'temperature' => 200, 'imageUrl' => '/weather-icons/sunny.png'], $result);
    }
}