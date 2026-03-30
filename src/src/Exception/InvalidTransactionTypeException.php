<?php

namespace App\Exception;

class InvalidTransactionTypeException extends DomainException
{
    protected $message = "La transaction est invalide.";
}