<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260126142539 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE delivery ADD startedÃ_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE delivery DROP started_at');
        $this->addSql('ALTER TABLE delivery ALTER completed_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN delivery.startedÃ_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN delivery.completed_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('DROP INDEX IDX_3FFF68A76F4F78C5');
        $this->addSql('ALTER TABLE delivery_location ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN delivery_location.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3FFF68A76F4F78C5 ON delivery_location (delivery_id_id)');
        $this->addSql('DROP INDEX IDX_957D8CB8778453BA');
        $this->addSql('ALTER TABLE dish ADD is_shown BOOLEAN NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957D8CB8778453BA ON dish (food_place_id_id)');
        $this->addSql('ALTER TABLE food_place ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN food_place.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('DROP INDEX IDX_F5299398778453BA');
        $this->addSql('DROP INDEX IDX_F52993989D86650F');
        $this->addSql('ALTER TABLE "order" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "order".created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_F52993989D86650F ON "order" (user_id_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_F5299398778453BA ON "order" (food_place_id_id)');
        $this->addSql('DROP INDEX IDX_52EA1F09157EBC1A');
        $this->addSql('DROP INDEX IDX_52EA1F09FCDAEAAA');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_52EA1F09FCDAEAAA ON order_item (order_id_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_52EA1F09157EBC1A ON order_item (dish_id_id)');
        $this->addSql('DROP INDEX IDX_D8892622778453BA');
        $this->addSql('DROP INDEX IDX_D88926229D86650F');
        $this->addSql('ALTER TABLE rating ADD created_ï¿½at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE rating DROP created_at');
        $this->addSql('COMMENT ON COLUMN rating.created_ï¿½at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D88926229D86650F ON rating (user_id_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D8892622778453BA ON rating (food_place_id_id)');
        $this->addSql('ALTER TABLE "user" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE wallet ALTER updated_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('DROP INDEX IDX_7DAF972F43F82D');
        $this->addSql('ALTER TABLE wallet_transaction ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet_transaction.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7DAF972F43F82D ON wallet_transaction (wallet_id_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP INDEX UNIQ_3FFF68A76F4F78C5');
        $this->addSql('ALTER TABLE delivery_location ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN delivery_location.created_at IS NULL');
        $this->addSql('CREATE INDEX IDX_3FFF68A76F4F78C5 ON delivery_location (delivery_id_id)');
        $this->addSql('DROP INDEX UNIQ_957D8CB8778453BA');
        $this->addSql('ALTER TABLE dish DROP is_shown');
        $this->addSql('CREATE INDEX IDX_957D8CB8778453BA ON dish (food_place_id_id)');
        $this->addSql('ALTER TABLE food_place ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN food_place.created_at IS NULL');
        $this->addSql('ALTER TABLE "user" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS NULL');
        $this->addSql('ALTER TABLE wallet ALTER updated_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet.updated_at IS NULL');
        $this->addSql('ALTER TABLE delivery ADD started_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE delivery DROP startedÃ_at');
        $this->addSql('ALTER TABLE delivery ALTER completed_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN delivery.completed_at IS NULL');
        $this->addSql('DROP INDEX UNIQ_F52993989D86650F');
        $this->addSql('DROP INDEX UNIQ_F5299398778453BA');
        $this->addSql('ALTER TABLE "order" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "order".created_at IS NULL');
        $this->addSql('CREATE INDEX IDX_F5299398778453BA ON "order" (food_place_id_id)');
        $this->addSql('CREATE INDEX IDX_F52993989D86650F ON "order" (user_id_id)');
        $this->addSql('DROP INDEX UNIQ_D88926229D86650F');
        $this->addSql('DROP INDEX UNIQ_D8892622778453BA');
        $this->addSql('ALTER TABLE rating ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE rating DROP created_ï¿½at');
        $this->addSql('CREATE INDEX IDX_D8892622778453BA ON rating (food_place_id_id)');
        $this->addSql('CREATE INDEX IDX_D88926229D86650F ON rating (user_id_id)');
        $this->addSql('DROP INDEX UNIQ_7DAF972F43F82D');
        $this->addSql('ALTER TABLE wallet_transaction ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN wallet_transaction.created_at IS NULL');
        $this->addSql('CREATE INDEX IDX_7DAF972F43F82D ON wallet_transaction (wallet_id_id)');
        $this->addSql('DROP INDEX UNIQ_52EA1F09FCDAEAAA');
        $this->addSql('DROP INDEX UNIQ_52EA1F09157EBC1A');
        $this->addSql('CREATE INDEX IDX_52EA1F09157EBC1A ON order_item (dish_id_id)');
        $this->addSql('CREATE INDEX IDX_52EA1F09FCDAEAAA ON order_item (order_id_id)');
    }
}
