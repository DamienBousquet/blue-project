#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
   CREATE DATABASE blueproject_test;
EOSQL

create_tables() {
    local dbname=$1
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$dbname" <<-EOSQL
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user') THEN
                CREATE TABLE "user" (
                    id SERIAL NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    latitude NUMERIC(10, 8) NOT NULL,
                    longitude NUMERIC(10, 8) NOT NULL,
                    location TEXT NULL,
                    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                    session_id TEXT NOT NULL,
                    PRIMARY KEY(session_id)
                );
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet') THEN
                CREATE TABLE wallet (
                    id SERIAL NOT NULL,
                    user_session_id TEXT NOT NULL,
                    balance NUMERIC(10, 2) DEFAULT NULL,
                    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                    PRIMARY KEY(id)
                );
                ALTER TABLE wallet ADD CONSTRAINT FK_wallet_user
                    FOREIGN KEY (user_session_id)
                    REFERENCES "user" (session_id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transaction') THEN
                CREATE TABLE wallet_transaction (
                    id SERIAL NOT NULL,
                    wallet_id_id INT DEFAULT NULL,
                    amount NUMERIC(10, 2) DEFAULT NULL,
                    type VARCHAR(255) NOT NULL,
                    reason TEXT DEFAULT NULL,
                    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                    PRIMARY KEY(id)
                );
                ALTER TABLE wallet_transaction ADD CONSTRAINT FK_wallet_transaction_wallet
                    FOREIGN KEY (wallet_id_id)
                    REFERENCES wallet (id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_place') THEN
                CREATE TABLE food_place (
                    id SERIAL NOT NULL,
                    name TEXT NOT NULL,
                    tags TEXT NOT NULL,
                    icon TEXT DEFAULT NULL,
                    latitude NUMERIC(10, 8) NOT NULL,
                    longitude NUMERIC(10, 8) NOT NULL,
                    is_open BOOLEAN NOT NULL,
                    rating_avg NUMERIC(10, 2) NULL,
                    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                    PRIMARY KEY(id)
                );
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dish') THEN
                CREATE TABLE dish (
                    id SERIAL NOT NULL,
                    food_place_id_id INT NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT DEFAULT NULL,
                    image_path TEXT DEFAULT NULL,
                    price NUMERIC(10, 2) NOT NULL,
                    is_available BOOLEAN NOT NULL,
                    is_shown BOOLEAN NOT NULL,
                    PRIMARY KEY(id)
                );
                ALTER TABLE dish ADD CONSTRAINT FK_957D8CB8778453BA
                    FOREIGN KEY (food_place_id_id)
                    REFERENCES food_place (id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order') THEN
                CREATE TABLE "order" (
                    id SERIAL NOT NULL,
                    user_session_id TEXT NOT NULL,
                    food_place_id_id INT NOT NULL,
                    total_price NUMERIC(10, 2) NOT NULL,
                    status TEXT NOT NULL,
                    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                    PRIMARY KEY(id)
                );
                ALTER TABLE "order" ADD CONSTRAINT FK_F52993989D86650F
                    FOREIGN KEY (user_session_id)
                    REFERENCES "user" (session_id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
                ALTER TABLE "order" ADD CONSTRAINT FK_F5299398778453BA
                    FOREIGN KEY (food_place_id_id)
                    REFERENCES food_place (id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_item') THEN
                CREATE TABLE order_item (
                    id SERIAL NOT NULL,
                    order_id_id INT NOT NULL,
                    dish_id_id INT NOT NULL,
                    quantity INT NOT NULL,
                    price_at_order NUMERIC(10, 2) NOT NULL,
                    PRIMARY KEY(id)
                );
                ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F09FCDAEAAA
                    FOREIGN KEY (order_id_id)
                    REFERENCES "order" (id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
                ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F09157EBC1A
                    FOREIGN KEY (dish_id_id)
                    REFERENCES dish (id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rating') THEN
                CREATE TABLE rating (
                    id SERIAL NOT NULL,
                    user_session_id TEXT NOT NULL,
                    food_place_id_id INT NOT NULL,
                    score INT NOT NULL,
                    comment TEXT DEFAULT NULL,
                    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                    PRIMARY KEY(id)
                );
                ALTER TABLE rating ADD CONSTRAINT FK_D88926229D86650F
                    FOREIGN KEY (user_session_id)
                    REFERENCES "user" (session_id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
                ALTER TABLE rating ADD CONSTRAINT FK_D8892622778453BA
                    FOREIGN KEY (food_place_id_id)
                    REFERENCES food_place (id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'delivery') THEN
                CREATE TABLE delivery (
                    id SERIAL NOT NULL,
                    order_id_id INT NOT NULL,
                    status TEXT NOT NULL,
                    started_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                    completed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
                    hashed_value TEXT NOT NULL,
                    PRIMARY KEY(id)
                );
                CREATE UNIQUE INDEX IF NOT EXISTS UNIQ_3781EC10FCDAEAAA ON delivery (order_id_id);
                ALTER TABLE delivery ADD CONSTRAINT FK_3781EC10FCDAEAAA
                    FOREIGN KEY (order_id_id)
                    REFERENCES "order" (id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'delivery_location') THEN
                CREATE TABLE delivery_location (
                    id SERIAL NOT NULL,
                    delivery_id_id INT NOT NULL,
                    latitude NUMERIC(10, 8) NOT NULL,
                    longitude NUMERIC(10, 8) NOT NULL,
                    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                    PRIMARY KEY(id)
                );
                ALTER TABLE delivery_location ADD CONSTRAINT FK_3FFF68A76F4F78C5
                    FOREIGN KEY (delivery_id_id)
                    REFERENCES delivery (id)
                    NOT DEFERRABLE INITIALLY IMMEDIATE;
            END IF;
        END
        \$\$;

        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'utils') THEN
                CREATE TABLE utils (
                    id SERIAL NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    value TEXT NOT NULL,
                    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
                    PRIMARY KEY(id)
                );
            END IF;
        END
        \$\$;
EOSQL
}

create_tables "blueproject_test"