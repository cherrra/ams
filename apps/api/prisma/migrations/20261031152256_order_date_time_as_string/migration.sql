-- Дата и время записи переводятся в строки ISO (DATE/VARCHAR совместимы по формату,
-- а TIME нужно сначала привести к 'HH:MM', иначе не влезет в VARCHAR(5)).

-- AlterTable (дата: DATE -> VARCHAR(10) без потери данных)
ALTER TABLE `orders` MODIFY `order_date` VARCHAR(10) NOT NULL;

-- Время: TIME -> VARCHAR(8) -> 'HH:MM' -> VARCHAR(5)
ALTER TABLE `orders` MODIFY `order_time` VARCHAR(8) NOT NULL;
UPDATE `orders` SET `order_time` = TIME_FORMAT(`order_time`, '%H:%i');
ALTER TABLE `orders` MODIFY `order_time` VARCHAR(5) NOT NULL;
