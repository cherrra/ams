-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `birth_date` DATE NULL,
    `phone_number` VARCHAR(15) NULL,
    `link_img` VARCHAR(255) NULL,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brand` (
    `id_brand` INTEGER NOT NULL AUTO_INCREMENT,
    `brand_name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `brand_brand_name_key`(`brand_name`),
    PRIMARY KEY (`id_brand`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `model` (
    `id_model` INTEGER NOT NULL AUTO_INCREMENT,
    `model_name` VARCHAR(255) NOT NULL,
    `id_brand` INTEGER NOT NULL,

    UNIQUE INDEX `model_id_brand_model_name_key`(`id_brand`, `model_name`),
    PRIMARY KEY (`id_model`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cars` (
    `id_car` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `id_model` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `mileage` INTEGER NOT NULL DEFAULT 0,
    `vin_code` VARCHAR(20) NULL,
    `license_plate` VARCHAR(15) NULL,
    `link_img` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cars_id_idx`(`id`),
    PRIMARY KEY (`id_car`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id_category` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id_category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id_service` INTEGER NOT NULL AUTO_INCREMENT,
    `service_name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(555) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `id_category` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `services_id_category_idx`(`id_category`),
    PRIMARY KEY (`id_service`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id_order` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `id_car` INTEGER NOT NULL,
    `order_date` DATE NOT NULL,
    `order_time` TIME(0) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `status` ENUM('created', 'accepted', 'in_progress', 'completed', 'canceled', 'finished') NOT NULL DEFAULT 'created',
    `comment` TEXT NULL,
    `doc` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `orders_id_idx`(`id`),
    INDEX `orders_order_date_order_time_idx`(`order_date`, `order_time`),
    PRIMARY KEY (`id_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_services` (
    `id_order_service` INTEGER NOT NULL AUTO_INCREMENT,
    `id_order` INTEGER NOT NULL,
    `id_service` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0,

    INDEX `order_services_id_order_idx`(`id_order`),
    PRIMARY KEY (`id_order_service`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `model` ADD CONSTRAINT `model_id_brand_fkey` FOREIGN KEY (`id_brand`) REFERENCES `brand`(`id_brand`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `cars_id_fkey` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `cars_id_model_fkey` FOREIGN KEY (`id_model`) REFERENCES `model`(`id_model`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_id_category_fkey` FOREIGN KEY (`id_category`) REFERENCES `categories`(`id_category`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_id_fkey` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_id_car_fkey` FOREIGN KEY (`id_car`) REFERENCES `cars`(`id_car`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_services` ADD CONSTRAINT `order_services_id_order_fkey` FOREIGN KEY (`id_order`) REFERENCES `orders`(`id_order`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_services` ADD CONSTRAINT `order_services_id_service_fkey` FOREIGN KEY (`id_service`) REFERENCES `services`(`id_service`) ON DELETE CASCADE ON UPDATE CASCADE;
