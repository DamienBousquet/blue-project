<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260124153415 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE delivery (id SERIAL NOT NULL, order_id_id INT NOT NULL, status TEXT NOT NULL, startedÃ_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, completed_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3781EC10FCDAEAAA ON delivery (order_id_id)');
        $this->addSql('COMMENT ON COLUMN delivery.startedÃ_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN delivery.completed_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE delivery_location (id SERIAL NOT NULL, delivery_id_id INT NOT NULL, latitude NUMERIC(10, 2) NOT NULL, longitude NUMERIC(10, 2) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3FFF68A76F4F78C5 ON delivery_location (delivery_id_id)');
        $this->addSql('COMMENT ON COLUMN delivery_location.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE order_item (id SERIAL NOT NULL, order_id_id INT NOT NULL, dish_id_id INT NOT NULL, quantity INT NOT NULL, price_at_order NUMERIC(10, 2) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_52EA1F09FCDAEAAA ON order_item (order_id_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_52EA1F09157EBC1A ON order_item (dish_id_id)');
        $this->addSql('CREATE TABLE rating (id SERIAL NOT NULL, user_id_id INT NOT NULL, food_place_id_id INT NOT NULL, score INT NOT NULL, comment TEXT DEFAULT NULL, created_Ãat TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D88926229D86650F ON rating (user_id_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D8892622778453BA ON rating (food_place_id_id)');
        $this->addSql('COMMENT ON COLUMN rating.created_Ãat IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE delivery ADD CONSTRAINT FK_3781EC10FCDAEAAA FOREIGN KEY (order_id_id) REFERENCES "order" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE delivery_location ADD CONSTRAINT FK_3FFF68A76F4F78C5 FOREIGN KEY (delivery_id_id) REFERENCES delivery (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F09FCDAEAAA FOREIGN KEY (order_id_id) REFERENCES "order" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F09157EBC1A FOREIGN KEY (dish_id_id) REFERENCES dish (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE rating ADD CONSTRAINT FK_D88926229D86650F FOREIGN KEY (user_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE rating ADD CONSTRAINT FK_D8892622778453BA FOREIGN KEY (food_place_id_id) REFERENCES food_place (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE food_place ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN food_place.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE "order" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "order".created_at IS \'(DC2Type:datetime_immutable)\'');
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
        $this->addSql('ALTER TABLE delivery DROP CONSTRAINT FK_3781EC10FCDAEAAA');
        $this->addSql('ALTER TABLE delivery_location DROP CONSTRAINT FK_3FFF68A76F4F78C5');
        $this->addSql('ALTER TABLE order_item DROP CONSTRAINT FK_52EA1F09FCDAEAAA');
        $this->addSql('ALTER TABLE order_item DROP CONSTRAINT FK_52EA1F09157EBC1A');
        $this->addSql('ALTER TABLE rating DROP CONSTRAINT FK_D88926229D86650F');
        $this->addSql('ALTER TABLE rating DROP CONSTRAINT FK_D8892622778453BA');
        $this->addSql('DROP TABLE delivery');
        $this->addSql('DROP TABLE delivery_location');
        $this->addSql('DROP TABLE order_item');
        $this->addSql('DROP TABLE rating');
        $this->addSql('ALTER TABLE "user" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS NULL');
        $this->addSql('ALTER TABLE food_place ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN food_place.created_at IS NULL');
        $this->addSql('ALTER TABLE wallet ALTER updated_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet.updated_at IS NULL');
        $this->addSql('ALTER TABLE "order" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "order".created_at IS NULL');
        $this->addSql('ALTER TABLE wallet_transaction ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet_transaction.created_at IS NULL');
    }
}
