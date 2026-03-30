<?php

namespace App\Repository;

use App\Entity\Dish;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Dish>
 */
class DishRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Dish::class);
    }

    /**
        * @return Dish[] Returns an array of Dish objects    
    */
    public function findAllDishFromPlace($idPlace): array{
        return $this->createQueryBuilder('d')
            ->where('d.food_place_id = :idPlace')
            ->setParameter('idPlace',$idPlace)
            ->getQuery()
            ->getResult()
        ;
    } 


    /**
        * @return Dish[] Returns an array of Dish objects    
    */
    public function findShownDishesFromPlace($idPlace): array{
        return $this->createQueryBuilder('d')
            ->where('d.food_place_id = :idPlace')
            ->andWhere('d.is_shown = TRUE')
            ->setParameter('idPlace',$idPlace)
            ->getQuery()
            ->getResult()
        ;
    } 


    //    /**
    //     * @return Dish[] Returns an array of Dish objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('d')
    //            ->andWhere('d.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('d.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Dish
    //    {
    //        return $this->createQueryBuilder('d')
    //            ->andWhere('d.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
