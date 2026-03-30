<?php

namespace App\Exception;

class InsufficientFundsException extends DomainException
{
    protected $message = "Vous n'avez pas les fonds suffisant.";
}