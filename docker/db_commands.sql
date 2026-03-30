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
-- CREATE UNIQUE INDEX UNIQ_user_email_session_id ON "user" (session_id);

CREATE TABLE wallet (
    id SERIAL NOT NULL,
    user_session_id TEXT NOT NULL,
    balance NUMERIC(10, 2) DEFAULT NULL,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY(id)
);
-- CREATE UNIQUE INDEX UNIQ_wallet_user_id ON wallet (user_id_id, session_id);
ALTER TABLE wallet ADD CONSTRAINT FK_wallet_user
    FOREIGN KEY (user_session_id)
    REFERENCES "user" (session_id)
    NOT DEFERRABLE INITIALLY IMMEDIATE;

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
ALTER TABLE food_place ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE;

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

CREATE TABLE delivery (
    id SERIAL NOT NULL, 
    order_id_id INT NOT NULL,
    status TEXT NOT NULL, 
    started_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, 
    completed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
    hashed_value TEXT NOT NULL, 
    PRIMARY KEY(id)
);
CREATE UNIQUE INDEX UNIQ_3781EC10FCDAEAAA ON delivery (order_id_id);
ALTER TABLE delivery ADD CONSTRAINT FK_3781EC10FCDAEAAA 
    FOREIGN KEY (order_id_id) 
    REFERENCES "order" (id)
    NOT DEFERRABLE INITIALLY IMMEDIATE;

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

-- tiens, tiens, tiens codif...
CREATE TABLE utils (
    id SERIAL NOT NULL,
    name VARCHAR(255) NOT NULL, 
    value TEXT NOT NULL, 
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL, 
    PRIMARY KEY(id)
);


INSERT INTO "user" (name, email, password_hash, latitude, longitude, location, created_at, session_id)
VALUES
('Alex Martin', 'alex@mail.com', 'o72hDsi2Flss7kZM', 48.8566, 2.3522, 'A', '2012-02-09 14:12', 's1'),
('Marie Dupont', 'marie@mail.com', 'j28jPb0HA23jm9sby', 48.8600, 2.3400, '', '2012-03-02 02:31', 's2'),
('William Burry', 'wburry@mail.com', 'heuH83vsH5s81fd', 48.8600, 2.3400, '', '2012-03-12 21:10', 's3'),
('Marco Dumfries', 'marcooo@mail.com', 'J9ozb82jpnR8lqd', 43.578063, 3.914105, '16 Rue du Grand Jardin', '2012-04-09 11:14', 's4'),
('Miriam Sthel', 'mm23@mail.com', 'j8bgJ8sPm56gdv', 48.8600, 2.3400, 'D', '2012-04-06 06:33', 's5');

INSERT INTO wallet (user_session_id, balance, updated_at)
VALUES
('s1', 48.08, '2012-04-02 11:37'),
('s2', 36.00, '2012-03-25 14:02'),
('s3', 13.32, '2012-04-01 11:47'),
('s4', 26.22, '2012-04-05 12:11');

INSERT INTO wallet_transaction (wallet_id_id, amount, type, reason, created_at)
VALUES
(1, 60.00, 'credit', '', '2012-04-02 11:37'),
(1, 11.92, 'debit', 'Order #123', '2012-04-02 11:37'),
(2, 36.00, 'credit', '','2012-04-02 11:37'),
(3, 38.00, 'credit', '', '2012-04-02 11:37'),
(3, 8.50, 'debit', 'Order #203', '2012-04-02 11:37'),
(3, 16.18, 'debit', 'Order #207', '2012-04-02 11:37'),
(4, 75.00, 'credit', '', '2012-04-02 11:37'),
(4, 49.77, 'debit', 'Order #211', '2012-04-02 11:37');

INSERT INTO food_place (name, tags, icon, latitude, longitude, is_open, rating_avg, created_at)
VALUES
('Burger Lab', 'burger, frites', 'burger', 43.564818, 3.899202, TRUE, 4.5, '2012-04-02 11:37'),
('Sushi Club House', 'sushi, ramen, ravioli, nouilles', 'sushi', 43.584525, 3.926392, TRUE, 4.7, '2012-04-02 11:37'),
('Mama Napoli', 'pizza, pâtes', 'pizza', 43.570240, 3.944204, FALSE, 4.6, '2012-04-02 11:37');


INSERT INTO dish (food_place_id_id, name, description, image_path, price, is_available, is_shown)
VALUES
(1, 'Cheeseburger', 'Bœuf, cheddar, salade, sauce maison', 'cheeseburger.png', 7.80, TRUE, TRUE),
(1, 'Bacon Burger', 'Bœuf x2, bacon, fromage', 'bacon-burger.png', 9.90, TRUE, TRUE),
(1, 'Frites (100g)', '100g de frites', 'frites.png', 2.00, TRUE, FALSE),

(2, 'Ramen Tonkotsu', 'Bouillon porc, œuf, nouilles', 'ramen-tonkotsu.png', 8.5, TRUE, TRUE),
(2, 'Yakisoba Poulet', 'Nouilles sautées, légumes croquants et poulet croustillant', 'yakisoba-poulet.png', 9.90, TRUE, FALSE),
(2, 'California Boat', 'Une expérience culinaire authentique (20 pièces)', 'california-boat.png', 19.90, TRUE, TRUE),
(2, 'Gyozas', 'Raviolis japonais (6 pièces)', 'gyozas.png', 6.00, TRUE, FALSE),
(2, '2x Onigiri', 'Onigiri à la viande (2 pièces)', 'onigiri.png', 1.00, TRUE, FALSE),

(3, 'Pizza Margherita', 'Base Tomate, mozzarella, olives, basilic', 'pizza-margherita.png', 10.00, TRUE, TRUE),
(3, 'Pizza Tandoori', 'Base Tomate, poulet, poivron, champignons', 'pizza-tandoori.png', 9.5, TRUE, TRUE),
(3, 'Pizza Végétarienne', 'Base Tomate, poivron, champignons', 'pizza-vege.png', 10.50, TRUE, FALSE),
(3, 'Pizza Quiche', 'Oui oui, le meilleur des deux mondes (Base Tomate, jambon, chorizo, persil)', 'pizza-quiche.png', 11.00, TRUE, FALSE),
(3, 'Pizza Pepperoni', 'Base Tomate, fromage, chorizo', 'pizza-pepperoni.png', 10.00, TRUE, FALSE),
(3, 'Pâtes Penne', 'Pâtes Penne, fromage, tomate, oignon', 'pates-penne.png', 8.00, TRUE, FALSE),
(3, 'Spaghetti Bolognaise', 'Spaghetti, sauce tomate, fromage, persil', 'spaghetti-bolognaise.png', 8.50, TRUE, FALSE),
(3, 'Tiramisu', 'Tiramisu (100g)', 'tiramisu.png', 2.50, TRUE, FALSE);

INSERT INTO "order" (user_session_id, food_place_id_id, total_price, status, created_at)
VALUES
('s3', 2, 31.20, 'DONE', '2011-03-20 11:00'),
('s4', 3, 8.50,  'DONE', '2011-03-22 11:05'),
('s4', 1, 25.00, 'DONE', '2011-03-25 11:10'),
('s1', 2, 16.30, 'DONE', '2011-03-28 11:12'),
('s1', 3, 19.99, 'DONE', '2011-04-01 11:00'),
('s1', 1, 14.50, 'DONE', '2011-04-05 11:05'),
('s2', 2, 27.80, 'DONE', '2011-04-10 11:10'),
('s4', 3, 11.25, 'DONE', '2011-04-15 11:12'),
('s3', 1, 33.75, 'DONE', '2011-04-20 11:08'),
('s5', 2, 10.00, 'DONE', '2011-04-25 11:00'),
('s3', 3, 22.50, 'DONE', '2011-05-01 11:05'),
('s4', 1, 17.99, 'DONE', '2011-05-10 11:10'),
('s5', 2, 13.40, 'DONE', '2011-05-15 11:12'),
('s2', 3, 29.99, 'DONE', '2011-05-20 11:08'),
('s3', 1, 8.75,  'DONE', '2011-05-25 11:00'),
('s5', 2, 20.50, 'DONE', '2011-06-01 11:05'),
('s4', 3, 15.75, 'DONE', '2011-06-10 11:10'),
('s3', 1, 24.99, 'DONE', '2011-06-15 11:12'),
('s4', 2, 18.25, 'DONE', '2011-06-20 11:08'),
('s1', 3, 9.50,  'DONE', '2011-06-25 11:00'),
('s1', 1, 30.00, 'DONE', '2011-07-01 11:05'),
('s2', 2, 12.75, 'DONE', '2011-07-10 11:10'),
('s4', 3, 21.50, 'DONE', '2011-07-15 11:12'),
('s4', 1, 16.99, 'DONE', '2011-07-20 11:08'),
('s2', 2, 19.25, 'DONE', '2011-07-25 11:00'),
('s4', 3, 10.75, 'DONE', '2011-08-01 11:05'),
('s3', 1, 28.50, 'DONE', '2011-08-10 11:10'),
('s2', 2, 14.99, 'DONE', '2011-08-15 11:12'),
('s2', 3, 23.75, 'DONE', '2011-08-20 11:08'),
('s1', 1, 11.00, 'DONE', '2011-08-25 11:00'),
('s1', 2, 35.50, 'DONE', '2011-09-01 11:05'),
('s4', 2, 14.40, 'DONE', '2012-04-01 11:18'),
('s1', 1, 22.40, 'DONE', '2012-04-02 11:37'),
('s4', 1, 9.40,  'DONE', '2012-04-05 12:11');

INSERT INTO order_item (order_id_id, dish_id_id, quantity, price_at_order)
VALUES
(1, 1, 1, 9.90),
(1, 2, 1, 12.50);

INSERT INTO rating (user_session_id, food_place_id_id, score, comment, created_at)
VALUES
('s1', 1, 5, 'Excellent burgers', '2012-04-02 11:37'),
('s2', 2, 4, 'Très bon ramen, livraison rapide', '2012-04-02 11:37');

INSERT INTO delivery (order_id_id, status, started_at, completed_at, hashed_value)
VALUES
(2, 'DONE', '2012-02-04 12:27' , '2012-02-04 12:40', 'EOKVRk0NhndSZcuvV2ey'),
(3, 'DONE', '2012-02-04 12:27' , '2012-02-04 12:40', 'EOKVRk0NhndSZcuvV2ey');

INSERT INTO delivery_location (delivery_id_id, latitude, longitude, created_at)
VALUES
(1, 48.8572, 2.3542, '2012-04-02 11:37'),
(1, 48.8568, 2.3530, '2012-04-02 11:37'),
(1, 48.8565, 2.3522, '2012-04-02 11:37');

INSERT INTO utils (name, value)
VALUES
('deliveryFee', '2.5'),
('timeFront', '2012-04-09 11:14');