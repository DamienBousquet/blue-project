<?php
namespace App\Tests\Unit\Service;

use App\Service\WalletService;
use App\Entity\Wallet;
use App\Entity\WalletTransaction;
use App\Repository\WalletRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Exception\InsufficientFundsException;
use App\Exception\InvalidTransactionTypeException;
use App\Exception\InvalidAmountException;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\Test;

class WalletServiceTest extends TestCase
{
    private WalletService $walletService;
    private WalletRepository $walletRepository;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->walletRepository = $this->createMock(WalletRepository::class);
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->walletService = new WalletService($this->walletRepository, $this->entityManager);
    }

    #[Test]
    public function testCreateTransactionThrowsExceptionForInvalidAmount()
    {
        $wallet = new Wallet();
        $wallet->setBalance('100.00');

        $this->expectException(InvalidAmountException::class);
        //value can't be negative
        $this->walletService->createTransaction($wallet, -10, 'debit');
    }

    #[Test]
    public function testCreateTransactionThrowsExceptionForInvalidType()
    {
        $wallet = new Wallet();
        $wallet->setBalance('100.00');

        $this->expectException(InvalidTransactionTypeException::class);
        $this->walletService->createTransaction($wallet, 10, 'invalid_type');
    }

    #[Test]
    public function testCreateTransactionCreatesCreditTransaction()
    {
        $wallet = new Wallet();
        $wallet->setBalance('100.00');

        $matcher = $this->exactly(2);
        $this->entityManager->expects($matcher)
            ->method('persist')
            ->willReturnCallback(function ($entity) use ($matcher, $wallet) {
            switch ($matcher->numberOfInvocations()) {
                case 1:
                    $this->assertInstanceOf(WalletTransaction::class, $entity);
                    break;
                case 2:
                    $this->assertEquals($wallet, $entity);
                    break;
                default:
                    $this->fail('persist() called more than twice');
            }
        });

        $this->entityManager->expects($this->once())
            ->method('flush');

        $transaction = $this->walletService->createTransaction($wallet, 50, 'credit');

        $this->assertInstanceOf(WalletTransaction::class, $transaction);
        $this->assertEquals('150.00', $wallet->getBalance());
        $this->assertEquals('50', $transaction->getAmount());
        $this->assertEquals('credit', $transaction->getType());
    }

    #[Test]
    public function testCreateTransactionCreatesDebitTransaction()
    {
        $wallet = new Wallet();
        $wallet->setBalance('100.00');

        $matcher = $this->exactly(2);
        $this->entityManager->expects($matcher)
            ->method('persist')
            ->willReturnCallback(function ($entity) use ($matcher, $wallet) {
            switch ($matcher->numberOfInvocations()) {
                case 1:
                    $this->assertInstanceOf(WalletTransaction::class, $entity);
                    break;
                case 2:
                    $this->assertEquals($wallet, $entity);
                    break;
                default:
                    $this->fail('persist() called more than twice');
            }
        });

        $this->entityManager->expects($this->once())
            ->method('flush');

        $transaction = $this->walletService->createTransaction($wallet, 50, 'debit');

        $this->assertInstanceOf(WalletTransaction::class, $transaction);
        $this->assertEquals('50.00', $wallet->getBalance());
        $this->assertEquals('50', $transaction->getAmount());
        $this->assertEquals('debit', $transaction->getType());
    }

    #[Test]
    public function testCreateTransactionCreatesTransactionWithReason()
    {
        $wallet = new Wallet();
        $wallet->setBalance('100.00');

        $matcher = $this->exactly(2);
        $this->entityManager->expects($matcher)
            ->method('persist')
            ->willReturnCallback(function ($entity) use ($matcher, $wallet) {
            switch ($matcher->numberOfInvocations()) {
                case 1:
                    $this->assertInstanceOf(WalletTransaction::class, $entity);
                    break;
                case 2:
                    $this->assertEquals($wallet, $entity);
                    break;
                default:
                    $this->fail('persist() called more than twice');
            }
        });

        $this->entityManager->expects($this->once())
            ->method('flush');

        $transaction = $this->walletService->createTransaction($wallet, 50, 'credit', 'Test reason');

        $this->assertInstanceOf(WalletTransaction::class, $transaction);
        $this->assertEquals('Test reason', $transaction->getReason());
    }

    #[Test]
    public function testAssertSufficientFundsThrowsExceptionForInsufficientFunds()
    {
        $wallet = new Wallet();
        $wallet->setBalance('50.00');

        $this->expectException(InsufficientFundsException::class);
        $this->walletService->assertSufficientFunds($wallet, 100);
    }

    #[Test]
    public function testAssertSufficientFundsDoesNotThrowExceptionForSufficientFunds()
    {
        $wallet = new Wallet();
        $wallet->setBalance('100.00');

        $this->walletService->assertSufficientFunds($wallet, 50);

        $this->assertTrue(true); // If no exception is thrown, the test passes
    }

    #[Test]
    public function testCalculateNewBalanceForCredit()
    {
        $wallet = new Wallet();
        $wallet->setBalance('100.00');

        $reflection = new \ReflectionClass($this->walletService);
        $method = $reflection->getMethod('calculateNewBalance');
        $newBalance = $method->invoke($this->walletService, $wallet, 50, 'credit');

        $this->assertEquals('150.00', $newBalance);
    }

    #[Test]
    public function testCalculateNewBalanceForDebit()
    {
        $wallet = new Wallet();
        $wallet->setBalance('100.00');

        $reflection = new \ReflectionClass($this->walletService);
        $method = $reflection->getMethod('calculateNewBalance');

        $newBalance = $method->invoke($this->walletService, $wallet, 50, 'debit');

        $this->assertEquals('50.00', $newBalance);
    }
}