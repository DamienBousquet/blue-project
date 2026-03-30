<?php
namespace App\UseCase;

use App\Repository\UtilsRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Utils;
use DateTimeImmutable;

class GetWeather{

    public function __construct(
        private UtilsRepository $utilsRepository,
        private EntityManagerInterface $em, 
    ){}

    public function execute(){
        $util = $this->utilsRepository->findOneBy(array('name' => 'weather'));
        if(!$util || $this->isValueOutdated($util)){
            $data = $this->sendRequestToApi();
            if(!$data || isset($data['error'])) return null;
            $imageUrl = $this->getImageWeatherCode($data["current"]["weather_code"], $data["current"]["is_day"]);
            if(!$imageUrl) return null;
            $temperature = round($data["current"]["temperature_2m"]);

            if(!$util){
                $util = new Utils();
                $util->setName('weather');
            };
            
            $util->setValue($temperature . '||' . $imageUrl);
            $util->setCreatedAt(new DateTimeImmutable());
            $this->em->persist($util);
            $this->em->flush();

            return ['place' => 'Lattes', 'temperature' => $temperature, 'imageUrl' => $imageUrl];
        }

        $value = $util->getValue();
        $valueArray = explode('||', $value);      
        return ['place' => 'Lattes', 'temperature' => $valueArray[0], 'imageUrl' => $valueArray[1]];
    }

    private function isValueOutdated($util): bool{
        if(!$util) return true;
        $timeLastCall = $util->getCreatedAt();
        $now = new DateTimeImmutable();
        $nowMinusMinutes = $now->modify('-30 minutes');
        if($timeLastCall < $nowMinusMinutes) return true;
        return false;

    }

    private function sendRequestToApi(){
        $params = [
            'latitude' => '43.34',
            'longitude' => '3.54',
            'models' => 'meteofrance_seamless',
            'current' => 'temperature_2m,weather_code,precipitation,is_day',
            'timezone' => 'Europe/Berlin',
        ];
        $endpoint = 'https://api.open-meteo.com/v1/forecast';
        $url = $endpoint . '?' . http_build_query($params);
        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        $data = json_decode($result, true);
        return $data;
    }

    //doc : https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
    private function getImageWeatherCode($weatherCode, $isDay) {
        $imageUrl = '/weather-icons/';
        switch ($weatherCode) {
            case 0:
                $imageUrl .= $isDay ? 'sunny.png' : 'night.png';
                break;
            case 1:
            case 2:
            case 3:
                $imageUrl .= $isDay ? 'sun-cloud.png' : 'night.png';
                break;
            // Overcast
            case 45:
            case 48:
                $imageUrl .= 'clouds.png';
                break;
            // Fog
            case 40:
            case 41:
            case 42:
            case 43:
            case 44:
                $imageUrl .= 'clouds.png'; 
                break;
            // Drizzle
            case 51:
            case 53:
            case 55:
                $imageUrl .= 'rainy.png';
                break;
            // Freezing Drizzle
            case 56:
            case 57:
                $imageUrl .= 'snow-rain.png';
                break;
            // Rain
            case 61:
            case 63:
            case 65:
                $imageUrl .= 'rainy.png';
                break;
            // Freezing Rain
            case 66:
            case 67:
                $imageUrl .= 'snow-rain.png';
                break;
            // Snow
            case 71:
            case 73:
            case 75:
            case 77:
                $imageUrl .= 'snow.png';
                break;
            // Snow grains
            case 79:
                $imageUrl .= 'snow.png';
                break;
            // Rain showers
            case 80:
            case 81:
            case 82:
                $imageUrl .= 'sun-rain.png';
                break;
            // Snow showers
            case 85:
            case 86:
                $imageUrl .= 'snow.png';
                break;
            // Thunderstorm
            case 95:
            case 96:
            case 99:
                $imageUrl .= 'storm-rain.png';
                break;
            default:
                return null;
        }
        return $imageUrl;
    }
}