<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260124144221 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE dish (id SERIAL NOT NULL, food_place_id_id INT NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT NULL, logo_path TEXT DEFAULT NULL, price NUMERIC(10, 2) NOT NULL, is_available BOOLEAN NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957D8CB8778453BA ON dish (food_place_id_id)');
        $this->addSql('ALTER TABLE dish ADD CONSTRAINT FK_957D8CB8778453BA FOREIGN KEY (food_place_id_id) REFERENCES food_place (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE food_place ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN food_place.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE food_place ADD PRIMARY KEY (id)');
        $this->addSql('ALTER TABLE "user" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE wallet ALTER updated_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE wallet_transaction ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet_transaction.created_at IS \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE dish DROP CONSTRAINT FK_957D8CB8778453BA');
        $this->addSql('DROP TABLE dish');
        $this->addSql('ALTER TABLE wallet_transaction ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet_transaction.created_at IS NULL');
        $this->addSql('ALTER TABLE wallet ALTER updated_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet.updated_at IS NULL');
        $this->addSql('ALTER TABLE food_place DROP CONSTRAINT food_place_pkey');
        $this->addSql('ALTER TABLE food_place ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN food_place.created_at IS NULL');
        $this->addSql('ALTER TABLE "user" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS NULL');
    }
}
