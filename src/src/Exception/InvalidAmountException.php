<?php

namespace App\Exception;

class InvalidAmountException extends DomainException
{
    protected $message = "Le montant est invalide.";
}