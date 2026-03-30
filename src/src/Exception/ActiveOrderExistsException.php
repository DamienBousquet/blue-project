<?php

namespace App\Exception;

class ActiveOrderExistsException extends DomainException
{
    protected $message = 'Une commande est déjà en cours.';
}