<?php

namespace App\Entity;

class DeliveryPerson{
    // private ?int $id = null;

    // private bool $isActive = false;

    // private float $longitude = 0;

    // private float $latitude = 0;

    public function __construct(
        private readonly int $id,
        private readonly float $longitude,
        private readonly float $latitude,
        private readonly bool $isActive
    ) {}

    public function getId(): int{
        return $this->id;
    }

    public function getLongitude(): float{
        return $this->longitude;
    }

    public function getLatitude(): float{
        return $this->latitude;
    }

    public function isAvailable(): bool{
        return !$this->isActive;
    }

    public function setCoordinate(float $longitude, float $latitude){
        $this->longitude = $longitude;
        $this->latitude = $latitude;
    }
}