<?php
namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Cookie;
use App\Service\HomeService;
use App\Service\Tictactoe;
use App\Security\JWTService;
use App\Service\UserService;
use App\UseCase\GetWeather;

class HomeController extends AbstractController{

    #[Route('/api/home', name: 'app_home', methods: ['GET'])]
    public function index(JwtService $jwtService, Request $request): Response
    {
        $marcoUID = 4;
        $token = $jwtService->generate($marcoUID);

        $jwtCookie = Cookie::create('DMFAuthorization')
            ->withValue($token)
            ->withPath('/')
            ->withHttpOnly(true)
            ->withSameSite('strict');


        $response = new JsonResponse([
            'success' => true
        ]);
        $response->headers->setCookie($jwtCookie);

        $session = $request->getSession();
        $session->invalidate();

        return $response;
    }

    #[Route('/api/session', name: 'session', methods: ['POST'])]
    public function session(Request $request, UserService $userService): Response
    {
        $session = $request->getSession();
        $session->set('session','');
        $sessionId = $session->getId();
        if($sessionId) $userService->createNewUser($sessionId);
        return new JsonResponse($sessionId);
    }

    private function getTicTacToeState($session): Tictactoe{
        $game = $session->get('game_state', new Tictactoe());
        return $game;
    }

    #[Route('/api/internetConnexion', name: 'internetConnexion', methods: ['GET', 'HEAD'])]
    public function internetConnexion(HomeService $homeService): JsonResponse{
        $result = $homeService->getInternetSpeed();
        return new JsonResponse($result);
    }

    #[Route('/api/tictactoeMove', name: 'tictactoeMove', methods: ['POST'])]
    public function tictactoeMove(Request $request): JsonResponse{
        //todo : check if request is not sent by the user that should exist (avoid spamming request)

        $data = json_decode($request->getContent(), true);
        $session = $request->getSession();
        $game = $this->getTicTacToeState($session);
        $map = $game->play($data);
        $session->set('game_state', $game);
        return new JsonResponse($map);
    }

    #[Route('/api/tictactoeReset', name: 'tictactoeReset', methods: ['GET'])]
    public function tictactoeReset(Request $request): JsonResponse{
        $session = $request->getSession();
        $game = $this->getTicTacToeState($session);
        $game->reset();
        $map = $game->getMap();
        $session->set('game_state', $game);
        return new JsonResponse($map);
    }

    
    #[Route('/api/weather', name: 'weather', methods:["GET"])]
    public function getWeather(GetWeather $getWeather): JsonResponse{
        $data = $getWeather->execute();
        return new JsonResponse($data);
    }

}