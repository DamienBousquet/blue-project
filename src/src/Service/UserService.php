<?php
namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use App\Entity\Wallet;
use DateTimeImmutable;
use App\Repository\UserRepository;
use App\Repository\WalletRepository;

class UserService{

    private $marcoId = 4;
    private $marcoSessionId = 's4';

    public function __construct(
        private EntityManagerInterface $em, 
        private UserRepository $userRepository,
        private WalletRepository $walletRepository,
    ) {}

    public function createNewUser($sessionId){
        $defaultUser = $this->userRepository->findOneBy(array('id' => $this->marcoId, 'session_id' => $this->marcoSessionId));
        $user = new User();
        $user->setName($defaultUser->getName());
        $user->setEmail($defaultUser->getEmail());
        $user->setLocation($defaultUser->getLocation());
        $user->setLatitude($defaultUser->getLatitude());
        $user->setLongitude($defaultUser->getLongitude());
        $user->setPasswordHash($defaultUser->getPasswordHash());
        $user->setCreatedAt(new DateTimeImmutable());
        $user->setSessionId($sessionId);
        $this->em->persist($user);

        $walletDefault = $this->walletRepository->findOneBy(array('user_session_id' => $this->marcoSessionId));
        $wallet = new Wallet();
        $wallet->setBalance($walletDefault->getBalance());
        $wallet->setUpdatedAt(new DateTimeImmutable());
        $wallet->setUserSessionId($sessionId);
        $this->em->persist($wallet);

        $this->em->flush();
    }
}