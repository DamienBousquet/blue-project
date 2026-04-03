<?php
namespace App\Tests\Integration\UseCase;

use App\UseCase\GetWeather;
use App\Repository\UtilsRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Utils;
use DateTimeImmutable;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use PHPUnit\Framework\Attributes\Test;

class GetWeatherIntegrationTest extends KernelTestCase
{
    private GetWeather $getWeather;
    private UtilsRepository $utilsRepository;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $this->utilsRepository = $container->get(UtilsRepository::class);
        $this->entityManager = $container->get(EntityManagerInterface::class);

        $this->getWeather = new GetWeather($this->utilsRepository, $this->entityManager);

        //in order to test this use case accordingly, the value need to be remove in the db
        $util = $this->utilsRepository->findOneBy(['name' => 'weather']);
        if ($util) {
            $this->entityManager->remove($util);
            $this->entityManager->flush();
        }
    }

    #[Test]
    public function testExecuteWithUpToDateData()
    {
        $util = new Utils();
        $util->setName('weather');
        $util->setValue('10||/weather-icons/sunny.png');
        $util->setCreatedAt(new DateTimeImmutable());

        $this->entityManager->persist($util);
        $this->entityManager->flush();

        $result = $this->getWeather->execute();

        $this->assertEquals(
            ['place' => 'Lattes', 'temperature' => '10', 'imageUrl' => '/weather-icons/sunny.png'],
            $result
        );
    }

    #[Test]
    public function testExecuteWithOutdatedData()
    {
        $util = new Utils();
        $util->setName('weather');
        $util->setValue('200||/weather-icons/sunny.png');
        $util->setCreatedAt((new DateTimeImmutable())->modify('-310 minutes'));

        $this->entityManager->persist($util);
        $this->entityManager->flush();

        $result = $this->getWeather->execute();

        $this->assertNotEquals(
            ['place' => 'Lattes', 'temperature' => 200, 'imageUrl' => '/weather-icons/sunny.png'],
            $result
        );
    }

    protected function tearDown(): void
    {
        $util = $this->utilsRepository->findOneBy(['name' => 'weather']);
        if ($util) {
            $this->entityManager->remove($util);
            $this->entityManager->flush();
        }
    }
}