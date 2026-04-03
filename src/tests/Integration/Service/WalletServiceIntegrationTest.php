<?php
namespace App\Tests\Integration\Service;

use App\Service\WalletService;
use App\Entity\Wallet;
use App\Entity\WalletTransaction;
use App\Repository\WalletRepository;
use App\Repository\UserRepository;
use App\Repository\WalletTransactionRepository;
use App\Exception\InsufficientFundsException;
use App\Exception\InvalidTransactionTypeException;
use App\Exception\InvalidAmountException;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use PHPUnit\Framework\Attributes\Test;
use DateTimeImmutable;
use App\Entity\User;

class WalletServiceIntegrationTest extends KernelTestCase
{
    private WalletService $walletService;
    private WalletRepository $walletRepository;
    private WalletTransactionRepository $walletTransactionRepository;
    private UserRepository $userRepository;

    protected function setUp(): void
    {
        self::bootKernel();
        $container = static::getContainer();
        $this->walletRepository = $container->get(WalletRepository::class);
        $this->userRepository = $container->get(UserRepository::class);
        $this->walletTransactionRepository = $container->get(WalletTransactionRepository::class);
        $entityManager = $container->get('doctrine')->getManager();
        $this->walletService = new WalletService($this->walletRepository, $entityManager);
    }

    #[Test]
    public function testCreateTransactionThrowsExceptionForInvalidAmount()
    {
        $wallet = $this->insertTestWallet('100.00');

        $this->expectException(InvalidAmountException::class);
        $this->walletService->createTransaction($wallet, -10, 'debit');
    }

    #[Test]
    public function testCreateTransactionThrowsExceptionForInvalidType()
    {
        $wallet = $this->insertTestWallet('100.00');

        $this->expectException(InvalidTransactionTypeException::class);
        $this->walletService->createTransaction($wallet, 10, 'invalid_type');
    }

    #[Test]
    public function testCreateTransactionCreatesCreditTransaction()
    {
        $wallet = $this->insertTestWallet('100.00');

        $transaction = $this->walletService->createTransaction($wallet, 50, 'credit');

        $this->assertInstanceOf(WalletTransaction::class, $transaction);
        $this->assertEquals('150.00', $wallet->getBalance());
        $this->assertEquals('50', $transaction->getAmount());
        $this->assertEquals('credit', $transaction->getType());
    }

    #[Test]
    public function testCreateTransactionCreatesDebitTransaction()
    {
        $wallet = $this->insertTestWallet('100.00');

        $transaction = $this->walletService->createTransaction($wallet, 50, 'debit');

        $this->assertInstanceOf(WalletTransaction::class, $transaction);
        $this->assertEquals('50.00', $wallet->getBalance());
        $this->assertEquals('50', $transaction->getAmount());
        $this->assertEquals('debit', $transaction->getType());
    }

    #[Test]
    public function testCreateTransactionCreatesTransactionWithReason()
    {
        $wallet = $this->insertTestWallet('100.00');

        $transaction = $this->walletService->createTransaction($wallet, 50, 'credit', 'Test reason');

        $this->assertInstanceOf(WalletTransaction::class, $transaction);
        $this->assertEquals('Test reason', $transaction->getReason());
    }

    #[Test]
    public function testAssertSufficientFundsThrowsExceptionForInsufficientFunds()
    {
        $wallet = $this->insertTestWallet('50.00');

        $this->expectException(InsufficientFundsException::class);
        $this->walletService->assertSufficientFunds($wallet, 100);
    }

    #[Test]
    public function testAssertSufficientFundsDoesNotThrowExceptionForSufficientFunds()
    {
        $wallet = $this->insertTestWallet('100.00');

        $this->walletService->assertSufficientFunds($wallet, 50);

        $this->assertTrue(true); // If no exception is thrown, the test passes
    }

    private function insertTestWallet(string $balance): Wallet
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $user = new User();
        $user->setCreatedAt(new DateTimeImmutable());
        $user->setEmail('example@mail.com');
        $user->setLatitude('43.561168');
        $user->setLongitude('3.901992');
        $user->setSessionId('s4');
        $user->setPasswordHash('password');
        $user->setName('Marco Dumfries');
        $wallet = new Wallet();
        $wallet->setBalance($balance);
        $wallet->setUserSessionId('s4');
        $wallet->setUpdatedAt(new DateTimeImmutable());
        $entityManager->persist($user);
        $entityManager->persist($wallet);
        $entityManager->flush();
        return $wallet;
    }

    protected function tearDown(): void
    {
        $entityManager = static::getContainer()->get('doctrine')->getManager();
        $walletTransactions = $this->walletTransactionRepository->findAll();
        foreach ($walletTransactions as $walletTransaction) {
            $entityManager->remove($walletTransaction);
        }
        $wallets = $this->walletRepository->findAll();
        foreach ($wallets as $wallet) {
            $entityManager->remove($wallet);
        }
        $users = $this->userRepository->findAll();
        foreach ($users as $user) {
            $entityManager->remove($user);
        }
        $entityManager->flush();
    }
}