<?php
namespace App\Serializer;

use App\Entity\User;
use App\Repository\WalletRepository;

class UserSerializer
{
    public function __construct(
        private WalletRepository $walletRepository
    ) {}

    public function serialize(
        User $user,
    ): array {
        $wallet = $this->walletRepository->findOneBy(array('user_session_id' => $user->getSessionId()));
        $wallet ? $balance = $wallet->getBalance() : $balance = 0;
        return [
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'location' => $user->getLocation(),
            'balance' => $balance,
        ];
    }


    public function serializeCollection(array $users): array
    {
        return array_map(
            fn(User $user) => $this->serialize($user
            ),$users
        );
    }
}