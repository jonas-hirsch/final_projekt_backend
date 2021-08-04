CREATE TABLE product (
   id  SERIAL PRIMARY KEY,
   title varchar(255),
   description text
);

CREATE TABLE stock (
   id  SERIAL PRIMARY KEY,
   price real CHECK (price >= 0),
   product int,
   discountAbsolute real CHECK (discountAbsolute >= 0),
   discountRelative int CHECK (discountRelative >= 0),
   quantity int CHECK (quantity >= 0),
   color varchar(255),
   size varchar(255),
   CONSTRAINT fk_product FOREIGN KEY(product) REFERENCES product(id)
);

CREATE TABLE media (
   id  SERIAL PRIMARY KEY,
   product int,
   type int,
   path varchar(255),
   CONSTRAINT fk_product FOREIGN KEY(product) REFERENCES product(id)
);

CREATE TYPE role AS ENUM ('admin', 'customer');

CREATE TABLE person (
   id  SERIAL PRIMARY KEY,
   email varchar(255) UNIQUE,
   password varchar(255),
   title varchar(20),
   firstName varchar(255),
   lastName varchar(255),
   role role
);

CREATE TABLE shoppingCard (
   id  SERIAL PRIMARY KEY,
   product int,
   person int,
   amount int,
   color varchar(255),
   size varchar(255),
   valideFrom timestamp,
   valideTo timestamp,
   stock int,
   CONSTRAINT fk_product FOREIGN KEY(product) REFERENCES product(id),
   CONSTRAINT fk_person FOREIGN KEY(person) REFERENCES person(id),
   CONSTRAINT product_once UNIQUE(product, person, color, size),
   CONSTRAINT FK_Stock FOREIGN KEY (stock) REFERENCES stock(id)

);

CREATE TABLE address (
   id  SERIAL PRIMARY KEY,
   person int,
   street varchar(255),
   houseNumber varchar(255),
   city varchar(255),
   postCode varchar(255),
   country varchar(255),
   isPrimary boolean,
   CONSTRAINT fk_person FOREIGN KEY(person) REFERENCES person(id),
   CONSTRAINT single_primary_address UNIQUE(person, isPrimary)
);

CREATE TABLE customerOrder (
   id  SERIAL PRIMARY KEY,
   person int,
   orderTime timestamp,
   shippingTime timestamp,
   trackingNumber varchar(255),
   active boolean DEFAULT true,
   CONSTRAINT fk_person FOREIGN KEY(person) REFERENCES person(id)
);

CREATE TABLE orderItem (
   id  SERIAL PRIMARY KEY,
   product int,
   customerOrder int,
   amount int,
   color varchar(255),
   size varchar(255),
   price numeric(8,2),
   CONSTRAINT fk_product FOREIGN KEY(product) REFERENCES product(id),
   CONSTRAINT fk_order FOREIGN KEY(customerOrder) REFERENCES customerOrder(id)
);

CREATE TABLE category (
   id  SERIAL PRIMARY KEY,
   name varchar(255)
);

CREATE TABLE productCategory (
   id SERIAL PRIMARY KEY,
   product int,
   category int,
   CONSTRAINT fk_product FOREIGN KEY(product) REFERENCES product(id),
   CONSTRAINT fk_category FOREIGN KEY(category) REFERENCES category(id)
)