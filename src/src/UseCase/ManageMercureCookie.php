<?php
namespace App\UseCase;

use App\Security\MercureCookieService;
use Symfony\Component\HttpFoundation\Cookie;
use App\Repository\OrderRepository;
use App\Repository\DeliveryRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ManageMercureCookie
{
    public function __construct(
        private MercureCookieService $mercureCookieService,
        private OrderRepository $orderRepository,
        private DeliveryRepository $deliveryRepository
    ) {}

    public function execute(Request $request): JsonResponse
    {
        $token = $request->cookies->get('mercureAuthorization');
        if ($token && $this->isTokenValid($token)) {
            return $this->successResponse();
        }

        return $this->handleNewCookie($request);
    }

    private function isTokenValid(string $token): bool
    {
        return $this->mercureCookieService->authenticate($token);
    }

    private function handleNewCookie(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $link = $this->extractLink($data);
        if (!$link) {
            return $this->errorResponse('Invalid link');
        }

        $delivery = $this->deliveryRepository->findOneBy(['hashed_value' => $link]);
        if (!$delivery) {
            return $this->errorResponse('Authentication failed: delivery not found');
        }

        $order = $this->orderRepository->find($delivery->getOrderId());
        if (!$order) {
            return $this->errorResponse('Authentication failed: order not found');
        }

        if (!$this->isUserAuthorized($order, $request->getSession())) {
            return $this->errorResponse('Authentication failed: unauthorized');
        }

        return $this->createCookieResponse($link);
    }

    private function extractLink(array $data): ?string
    {
        if (!isset($data['link'])) {
            return null;
        }
        $parts = explode('/', $data['link']);
        return $parts[1] ?? null;
    }

    private function isUserAuthorized($order, $session): bool
    {
        return $order->getUserSessionId() === $session->getId();
    }

    private function createCookieResponse(string $link): JsonResponse
    {
        $mercureToken = $this->mercureCookieService->generate($link);
        $mercureCookie = Cookie::create('mercureAuthorization')
            ->withValue($mercureToken)
            ->withPath('/.well-known/mercure')
            ->withHttpOnly(true)
            ->withSameSite('Lax');

        $response = $this->successResponse();
        $response->headers->setCookie($mercureCookie);
        return $response;
    }

    private function successResponse(): JsonResponse
    {
        return new JsonResponse(['success' => true]);
    }

    private function errorResponse(string $message, int $status = 401): JsonResponse
    {
        return new JsonResponse(['error' => $message], $status);
    }
}
