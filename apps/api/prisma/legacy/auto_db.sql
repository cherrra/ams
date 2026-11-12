-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Окт 31 2026 г., 17:49
-- Версия сервера: 8.0.30
-- Версия PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `auto_db`
--

-- --------------------------------------------------------

--
-- Структура таблицы `brand`
--

CREATE TABLE `brand` (
  `id_brand` int NOT NULL,
  `brand_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `brand`
--

INSERT INTO `brand` (`id_brand`, `brand_name`) VALUES
(1, 'Toyota'),
(2, 'BMW'),
(3, 'A6'),
(4, 'Camry'),
(5, 'Toyota1'),
(6, 'xxzzz'),
(7, 'hdjsj'),
(8, 'hdjsj1'),
(9, 'hdjsj11'),
(10, 'hghhgvt'),
(11, 'hghhgvt1'),
(12, 'ggghhh'),
(13, 'ggghhh1'),
(14, 'ffff');

-- --------------------------------------------------------

--
-- Структура таблицы `cars`
--

CREATE TABLE `cars` (
  `id_car` int NOT NULL,
  `year` int NOT NULL,
  `mileage` int NOT NULL,
  `id` int DEFAULT NULL,
  `vin_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `license_plate` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_model` int NOT NULL,
  `link_img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `cars`
--

INSERT INTO `cars` (`id_car`, `year`, `mileage`, `id`, `vin_code`, `license_plate`, `id_model`, `link_img`) VALUES
(1, 1970, 15001, 9, 'JT12345678901234', 'А123АА 177', 1, 'uploads/mark2.jpg'),
(6, 2022, 35000, 2, 'WBAAA12345678901', 'М001ММ 77', 3, ''),
(9, 1970, 11111, 17, NULL, NULL, 1, ''),
(13, 2012, 6757, 9, 'JBAAA12345678901', 'B001AМ 77', 15, 'uploads/1745613070890-51639533.jpg');

-- --------------------------------------------------------

--
-- Структура таблицы `categories`
--

CREATE TABLE `categories` (
  `id_category` int NOT NULL,
  `category_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `categories`
--

INSERT INTO `categories` (`id_category`, `category_name`) VALUES
(1, 'Двигатель и смазочные материалы'),
(2, 'Диагностика и обслуживание'),
(3, 'Фильтры');

-- --------------------------------------------------------

--
-- Структура таблицы `model`
--

CREATE TABLE `model` (
  `id_model` int NOT NULL,
  `model_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `id_brand` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `model`
--

INSERT INTO `model` (`id_model`, `model_name`, `id_brand`) VALUES
(1, 'Mark 2', 1),
(2, 'Camry', 1),
(3, 'X5', 2),
(4, 'Audi', 3),
(5, 'Toyota', 4),
(6, 'Mark 2', 5),
(7, 'dddfff', 6),
(8, 'ndndn', 7),
(9, 'ndndn', 8),
(10, 'ndndn', 9),
(11, 'ghhhrccr', 10),
(12, 'ghhhrccr', 11),
(13, 'yhhhhh', 12),
(14, 'yhhhhh', 13),
(15, 'Camry', 5),
(16, 'hjsjsns', 14);

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `id_order` int NOT NULL,
  `id` int NOT NULL,
  `id_car` int NOT NULL,
  `order_date` date NOT NULL,
  `order_time` time NOT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('created','accepted','in_progress','completed','canceled','finished') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'created',
  `comment` text COLLATE utf8mb4_general_ci,
  `doc` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `orders`
--

INSERT INTO `orders` (`id_order`, `id`, `id_car`, `order_date`, `order_time`, `total_price`, `status`, `comment`, `doc`) VALUES
(1, 9, 1, '2024-12-28', '14:30:00', '2000.00', 'in_progress', 'Замена масла и диагностика', NULL),
(2, 2, 6, '2024-12-12', '15:00:00', '345.00', 'in_progress', 'Проблемы с двигателем', NULL),
(31, 9, 1, '2024-12-20', '15:30:00', '100.00', 'finished', 'help', 'uploads/1773513861530-459359656.pdf'),
(33, 9, 1, '2025-03-19', '05:25:00', '300.00', 'completed', 'rrrrr', NULL),
(34, 9, 1, '2026-03-10', '10:00:00', '2000.00', 'accepted', 'help', NULL),
(35, 9, 1, '2026-03-05', '18:47:00', '10000.00', 'created', 'ggg', NULL),
(37, 9, 13, '2026-03-06', '10:19:00', '2000.00', 'finished', 'akskkskd', 'uploads/1773513616895-13610412.pdf');

-- --------------------------------------------------------

--
-- Структура таблицы `order_services`
--

CREATE TABLE `order_services` (
  `id_order_service` int NOT NULL,
  `id_order` int NOT NULL,
  `id_service` int NOT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `order_services`
--

INSERT INTO `order_services` (`id_order_service`, `id_order`, `id_service`, `price`) VALUES
(1, 1, 2, '500.00'),
(2, 1, 3, '1500.00'),
(3, 2, 4, '345.00'),
(17, 31, 1, '100.00'),
(20, 33, 1, '100.00'),
(21, 33, 2, '200.00'),
(22, 34, 1, '2000.00'),
(23, 35, 6, '10000.00'),
(25, 37, 1, '2000.00');

-- --------------------------------------------------------

--
-- Структура таблицы `services`
--

CREATE TABLE `services` (
  `id_service` int NOT NULL,
  `service_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(555) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `id_category` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `services`
--

INSERT INTO `services` (`id_service`, `service_name`, `description`, `price`, `id_category`) VALUES
(1, 'Замена масла в ДВС', 'Слив отработанного и заливка нового моторного масла с заменой масляного фильтра для продления срока службы двигателя.', '2000.00', 1),
(2, 'Диагностика компьютерная', 'Подключение автомобиля к сканеру для считывания ошибок, проверки работы электронных систем и выявления неисправностей.', '2000.00', 2),
(3, 'Замена комплекта фильтров', 'Полная замена воздушного, салонного и масляного фильтров для обеспечения корректной работы всех систем автомобиля.', '2000.00', 3),
(4, 'Масло 5w30', 'Смазочный материал, подходящий для большинства современных двигателей — используется при замене масла.', '1600.00', 1),
(6, 'Замена комплекта ГРМ', 'Полная замена ремня ГРМ и роликов — предотвращает обрыв ремня и серьезные повреждения двигателя.', '10000.00', 1),
(7, 'Мойка радиаторов', 'Промывка радиаторов охлаждения и кондиционера от загрязнений для предотвращения перегрева и повышения эффективности.', '25000.00', 2),
(9, 'Замена топливного фильтра', 'Обновление фильтра, очищающего топливо от загрязнений, для защиты двигателя и стабильной работы топливной системы.', '2000.00', 3),
(10, 'Дополнительные слесарные работы', 'Выполнение мелких и нестандартных ремонтных работ по ходовой части и другим узлам автомобиля.', '3000.00', 2);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `birth_date` date DEFAULT NULL,
  `phone_number` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `link_img` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `id_car` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `birth_date`, `phone_number`, `link_img`, `is_admin`, `id_car`) VALUES
(2, 'aaa', 'aaa@aaa.ru', '$2a$10$CocfiFWyjSb/XdWD8oHlLeaqCeXkAA/hMtrp9YDC.E6O/CD79jNS2', NULL, NULL, NULL, 0, NULL),
(9, 'Anna', 'cherrr@mail.ru', '$2a$10$zVB.lV5W7fkqoor2sIGaUeE1hhR3tFlvFLWWnIOA6gLTrlFh/YCu.', '2005-06-23', '+79281373959', 'uploads/1772662727947-835962380.jpeg', 0, NULL),
(13, 'admin', 'carservice@admin-mail.ru', '$2a$10$TnA7IJDtid2CTKKyym7.qO75kxNoZ3M6SXfUW2JhFQVqpM.piCToK', NULL, NULL, NULL, 1, NULL),
(17, 'Anya', 'chera@mail.ru', '$2a$10$YzO2zMev2/zp.MJZ.2MU1uVRwDdYfle8yCyq9jik93ksBsb9ZdQaO', '2005-06-23', 'null', NULL, 0, NULL),
(20, 'Artem', 'lolkek@gmail.com', '$2a$10$DfTYgX8fE9Fn.0A4k6LS5eCBaK8UlzNfsmLZNTKjkpHXou/yui0xG', NULL, NULL, NULL, 0, NULL),
(21, 'FRGETB', 'noterror@mail.ru', '$2a$10$NK1bjaDZ.WIAbkLAoT2gJeVqrUNabJq9zzVOJU.tjiSUcoVFWfFBm', NULL, NULL, NULL, 0, NULL),
(22, 'testtest', 'testtest@mail.ru', '$2b$10$o9htC3s1x46FRHW.wW6g7uc/JNPZ07m5q/fMa4qghAFYjwNPyEtA6', NULL, NULL, NULL, 0, NULL);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`id_brand`);

--
-- Индексы таблицы `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id_car`),
  ADD KEY `cars_ibfk_1` (`id`),
  ADD KEY `id_model` (`id_model`);

--
-- Индексы таблицы `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id_category`);

--
-- Индексы таблицы `model`
--
ALTER TABLE `model`
  ADD PRIMARY KEY (`id_model`),
  ADD KEY `id_brand` (`id_brand`);

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id_order`),
  ADD KEY `id` (`id`),
  ADD KEY `id_car` (`id_car`);

--
-- Индексы таблицы `order_services`
--
ALTER TABLE `order_services`
  ADD PRIMARY KEY (`id_order_service`),
  ADD KEY `id_order` (`id_order`),
  ADD KEY `id_service` (`id_service`);

--
-- Индексы таблицы `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id_service`),
  ADD KEY `id_category` (`id_category`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_car` (`id_car`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `brand`
--
ALTER TABLE `brand`
  MODIFY `id_brand` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT для таблицы `cars`
--
ALTER TABLE `cars`
  MODIFY `id_car` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT для таблицы `categories`
--
ALTER TABLE `categories`
  MODIFY `id_category` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `model`
--
ALTER TABLE `model`
  MODIFY `id_model` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id_order` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT для таблицы `order_services`
--
ALTER TABLE `order_services`
  MODIFY `id_order_service` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT для таблицы `services`
--
ALTER TABLE `services`
  MODIFY `id_service` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `cars`
--
ALTER TABLE `cars`
  ADD CONSTRAINT `cars_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cars_ibfk_2` FOREIGN KEY (`id_model`) REFERENCES `model` (`id_model`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `model`
--
ALTER TABLE `model`
  ADD CONSTRAINT `model_ibfk_1` FOREIGN KEY (`id_brand`) REFERENCES `brand` (`id_brand`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`id_car`) REFERENCES `cars` (`id_car`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `order_services`
--
ALTER TABLE `order_services`
  ADD CONSTRAINT `order_services_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_services_ibfk_2` FOREIGN KEY (`id_service`) REFERENCES `services` (`id_service`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`id_category`) REFERENCES `categories` (`id_category`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_car`) REFERENCES `cars` (`id_car`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
