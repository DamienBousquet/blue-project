<?php

namespace App\Repository;

use App\Entity\Order;
use DateTimeImmutable;
use DateTime;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Order>
 */
class OrderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Order::class);
    }

    //    /**
    //     * @return Order[] Returns an array of Order objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('o')
    //            ->andWhere('o.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('o.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Order
    //    {
    //        return $this->createQueryBuilder('o')
    //            ->andWhere('o.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    public function findLatestOrderFromUser($sessionId): ?Order
    {
        return $this->createQueryBuilder('o')
            ->andWhere('o.user_session_id = :session_id')
            ->setParameter('session_id', $sessionId)
            ->orderBy('o.created_at', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findRecentPaidOrders(): array
    {
        $date = new DateTime();
        $now = new DateTime();
        $currentHour = (int)$now->format('H');
        $currentMinute = (int)$now->format('i');
        $currentSecond = (int)$now->format('s');
        $date->setDate(2012,4,9);
        $date->setTime($currentHour,$currentMinute, $currentSecond);
        $date->modify('- 4500 minutes');
        $formattedDate = $date->format('Y-m-d H:i:s');
        return $this->createQueryBuilder('o')
            ->andWhere("o.status = 'PAID'")
            ->andWhere('o.created_at > :date')
            ->setParameter('date', $formattedDate)
            ->setMaxResults(100)
            ->getQuery()
            ->getResult()
        ;
    }
}
