CREATE DATABASE IF NOT EXISTS sims;
USE sims;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spare_parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_in (
    id INT PRIMARY KEY AUTO_INCREMENT,
    spare_part_id INT NOT NULL,
    stock_in_quantity INT NOT NULL,
    stock_in_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id)
);

CREATE TABLE IF NOT EXISTS stock_out (
    id INT PRIMARY KEY AUTO_INCREMENT,
    spare_part_id INT NOT NULL,
    stock_out_quantity INT NOT NULL,
    stock_out_unit_price DECIMAL(10, 2) NOT NULL,
    stock_out_total_price DECIMAL(10, 2) GENERATED ALWAYS AS (stock_out_quantity * stock_out_unit_price),
    stock_out_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id)
);

-- Create a trigger to update spare_parts quantity when stock comes in
DELIMITER //
CREATE TRIGGER after_stock_in
AFTER INSERT ON stock_in
FOR EACH ROW
BEGIN
    UPDATE spare_parts
    SET quantity = quantity + NEW.stock_in_quantity
    WHERE id = NEW.spare_part_id;
END //

-- Create a trigger to update spare_parts quantity when stock goes out
CREATE TRIGGER after_stock_out
AFTER INSERT ON stock_out
FOR EACH ROW
BEGIN
    UPDATE spare_parts
    SET quantity = quantity - NEW.stock_out_quantity
    WHERE id = NEW.spare_part_id;
END //
DELIMITER ;
