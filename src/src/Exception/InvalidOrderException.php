<?php

namespace App\Exception;

class InvalidOrderException extends DomainException
{
    protected $message = 'Une erreur est parvenue.';
}