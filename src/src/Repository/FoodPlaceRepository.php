<?php

namespace App\Repository;

use App\Entity\FoodPlace;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FoodPlace>
 */
class FoodPlaceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FoodPlace::class);
    }


        /**
            * @return FoodPlace[] Returns an array of FoodPlace objects
        */
        public function findFoodPlaceFromTagsOrName($tags): array
        {
            // $query =  $this->createQueryBuilder('f')
            // ;
            // foreach ($tags as $key => $mot) {
            //     $val = 'val' . $key;
            //     $query =  $query->orWhere("f.tags LIKE :" . $val)
            //         ->setParameter($val, '%' . $mot . '%')
            //     ;
            // }
            // $query = $query
            //     ->orderBy('f.id', 'ASC')
            //     ->setMaxResults(50)
            //     ->getQuery()
            // ;
            // $result = $query->getResult();
            // return $result;

            // if (empty($tags)) {
            //     return [];
            // }

            $qb = $this->createQueryBuilder('f');

            $orX = $qb->expr()->orX();
            foreach ($tags as $key => $tag) {
                $orX->add(
                    $qb->expr()->orX(
                        $qb->expr()->like('LOWER(f.name)', ':tag_' . $key),
                        $qb->expr()->like('LOWER(f.tags)', ':tag_' . $key)
                    )
                );
                $qb->setParameter('tag_' . $key, '%' . strtolower($tag) . '%');
            }

            return $qb
                ->andWhere($orX)
                ->orderBy('f.id', 'asc')
                ->setMaxResults(50)
                ->getQuery()
                ->getResult();
            }

    //    /**
    //     * @return FoodPlace[] Returns an array of FoodPlace objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('f')
    //            ->andWhere('f.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('f.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?FoodPlace
    //    {
    //        return $this->createQueryBuilder('f')
    //            ->andWhere('f.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}