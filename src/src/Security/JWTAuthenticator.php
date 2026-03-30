<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class JWTAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private JWTService $jwtService,
        private UserProviderInterface $userProvider
    ) {}

    public function supports(Request $request): ?bool
    {
        if (!str_starts_with($request->getPathInfo(), '/api/dmf')) {
            return false;
        }

        return $request->cookies->has('DMFAuthorization');
    }

    public function authenticate(Request $request): SelfValidatingPassport
    {
        $token = $request->cookies->get('DMFAuthorization');

        if (!$token) {
            throw new AuthenticationException('JWT token not found');
        }

        try {
            $userId = $this->jwtService->getUserIdFromToken($token);
        } catch (\Throwable $e) {
            throw new AuthenticationException('Invalid or expired JWT');
        }

        return new SelfValidatingPassport(
            new UserBadge((string) $userId, function ($identifier) {
                return $this->userProvider->loadUserByIdentifier($identifier);
            })
        );
    }
    public function onAuthenticationFailure(
        Request $request,
        AuthenticationException $exception
    ): ?Response {
        return new JsonResponse([
            'error' => 'Unauthorized',
            'message' => $exception->getMessage()
        ], Response::HTTP_UNAUTHORIZED);
    }

    public function onAuthenticationSuccess(
        Request $request,
        TokenInterface $token,
        string $firewallName
    ): ?Response {
        return null;
    }
}