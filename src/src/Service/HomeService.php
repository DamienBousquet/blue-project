<?php
namespace App\Service;

class HomeService
{
    public function getInternetSpeed(): string
    {
        $gaussianNumber = $this->gaussianRand();
        return $gaussianNumber;
    }

    function gaussianRand($min = 10, $max = 100, $mean = 50, $stdDev = 15)
    {
        $x = mt_rand() / mt_getrandmax();
        $y = mt_rand() / mt_getrandmax();
        $z = sqrt(-2.0 * log($x)) * cos(2.0 * M_PI * $y);
        $value = $z * $stdDev + $mean;
        return round(max($min, min($max, $value)),1);
    }

}
