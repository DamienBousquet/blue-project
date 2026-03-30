<?php

namespace App\Security;

use Symfony\Component\DependencyInjection\ParameterBag\ContainerBagInterface;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Token\Parser;
use Lcobucci\JWT\Token\Plain;
use Lcobucci\JWT\Encoding\JoseEncoder;
use Lcobucci\JWT\Validation\Validator;
use Lcobucci\JWT\Validation\Constraint\LooseValidAt;
use Lcobucci\JWT\Validation\Constraint\SignedWith;
use Lcobucci\JWT\Validation\RequiredConstraintsViolated;
// use Lcobucci\JWT\Clock\SystemClock;
// use Lcobucci\Clock\Clock;
use Lcobucci\JWT\Validation\Constraint\IssuedBy;

class MercureCookieService
{
    private string $secret = '';
    private Configuration $config;

    public function __construct(private ContainerBagInterface $params) {
        $this->secret = $this->params->get('mercure.secret');
        $this->config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($this->secret)
        );
    }

    public function generate($link): string
    {

        $token = $this->config->builder()
            ->withClaim('mercure', [
                'subscribe' => ['delivery/'.$link],
            ])            
            ->issuedBy('blueProject')
            ->permittedFor('blueProject')
            ->getToken(
                $this->config->signer(),
                $this->config->signingKey()
            );

        return $token->toString();
    }

    public function authenticate($token){
        try {
            $parsedToken = $this->config->parser()->parse($token);
            assert($parsedToken instanceof Plain);
            $this->config->validator()->assert(
                        $parsedToken,
                        new SignedWith($this->config->signer(), $this->config->signingKey()),
                        new IssuedBy('blueProject'),
                        // new LooseValidAt(), 
                    );

            $claims = $parsedToken->claims();
            if (!isset($claims->get('mercure')['subscribe'])) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
    
}
