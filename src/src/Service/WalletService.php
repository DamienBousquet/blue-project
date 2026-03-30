<?php
namespace App\Service;

use App\Entity\Wallet;
use App\Entity\WalletTransaction;
use App\Repository\WalletRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Exception\InsufficientFundsException;
use App\Exception\InvalidTransactionTypeException;
use App\Exception\InvalidAmountException;

class WalletService
{
    public function __construct(WalletRepository $walletRepository, private EntityManagerInterface $em) {}

    public function createTransaction(Wallet $wallet, float $amount, string $type, ?string $reason = null): WalletTransaction
    {
        if ($amount <= 0) {
            throw new InvalidAmountException();
        }
        if (!in_array($type, ['debit', 'credit'])) {
            throw new InvalidTransactionTypeException();
        }

        $transaction = new WalletTransaction();
        $transaction->setWalletId($wallet);
        $transaction->setAmount($amount);
        $transaction->setType($type);
        $transaction->setReason($reason);
        $transaction->setCreatedAt(new \DateTimeImmutable());

        $newBalance = $this->calculateNewBalance($wallet, $amount, $type);

        $wallet->setBalance($newBalance);
        $wallet->setUpdatedAt(new \DateTimeImmutable());

        $this->em->persist($transaction);
        $this->em->persist($wallet);
        $this->em->flush();

        return $transaction;
    }

    private function calculateNewBalance(Wallet $wallet, float $amount, string $type): string
    {
        return $type === 'debit'
            ? bcadd($wallet->getBalance(), -$amount, 2)
            : bcadd($wallet->getBalance(), $amount, 2);
    }

    public function assertSufficientFunds($wallet, $amount){
        if ($wallet->getBalance() < $amount) {
            throw new InsufficientFundsException();
        }
    }
}
