<?php
namespace App\Security;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Token\Plain;
use Lcobucci\JWT\Validation\Constraint\SignedWith;
use Lcobucci\JWT\Validation\Constraint\IssuedBy;
use Lcobucci\JWT\Validation\Constraint\StrictValidAt;
use Lcobucci\Clock\SystemClock;
use Symfony\Component\DependencyInjection\ParameterBag\ContainerBagInterface;

class JWTService
{
    private Configuration $config;

    public function __construct(private ContainerBagInterface $params)
    {
        $this->config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($this->params->get('DMF.secret'))
        );
    }

    public function generate($uid): string{
        $now = new \DateTimeImmutable();
        $token = $this->config->builder()
            ->issuedBy('blueProject')
            ->permittedFor('blueProject')
            ->issuedAt($now)
            ->expiresAt($now->modify('+10 hour'))
            ->withClaim('uid', $uid);
        return $token->getToken($this->config->signer(), $this->config->signingKey())->toString();
    }

    public function getUserIdFromToken(string $token): int
    {
        $token = $this->config->parser()->parse($token);

        //TODO : refuse expired token
        // $this->config->validator()->assert(
        //     $token,
        //     new StrictValidAt(SystemClock::fromUTC())
        // );

        assert($token instanceof Plain);

        $this->config->validator()->assert($token, new SignedWith($this->config->signer(), $this->config->signingKey()));
        $this->config->validator()->assert($token, new IssuedBy('blueProject'));

        $claims = $token->claims();        
        return $claims->get('uid');
    }
}