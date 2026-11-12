/**
 * Сид: переносит данные из legacy-дампа auto_db.sql.
 * Идентификаторы сохраняются, пароли пользователей — уже готовые bcrypt-хэши.
 * Дополнительно создаются два демо-аккаунта с известными паролями.
 */
import { PrismaClient, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const date = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

async function main(): Promise<void> {
  await prisma.orderService.deleteMany();
  await prisma.order.deleteMany();
  await prisma.car.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.model.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  await prisma.brand.createMany({
    data: [
      { idBrand: 1, brandName: 'Toyota' },
      { idBrand: 2, brandName: 'BMW' },
      { idBrand: 3, brandName: 'A6' },
      { idBrand: 4, brandName: 'Camry' },
      { idBrand: 5, brandName: 'Toyota1' },
      { idBrand: 6, brandName: 'xxzzz' },
      { idBrand: 7, brandName: 'hdjsj' },
      { idBrand: 8, brandName: 'hdjsj1' },
      { idBrand: 9, brandName: 'hdjsj11' },
      { idBrand: 10, brandName: 'hghhgvt' },
      { idBrand: 11, brandName: 'hghhgvt1' },
      { idBrand: 12, brandName: 'ggghhh' },
      { idBrand: 13, brandName: 'ggghhh1' },
      { idBrand: 14, brandName: 'ffff' },
    ],
  });

  await prisma.model.createMany({
    data: [
      { idModel: 1, modelName: 'Mark 2', brandId: 1 },
      { idModel: 2, modelName: 'Camry', brandId: 1 },
      { idModel: 3, modelName: 'X5', brandId: 2 },
      { idModel: 4, modelName: 'Audi', brandId: 3 },
      { idModel: 5, modelName: 'Toyota', brandId: 4 },
      { idModel: 6, modelName: 'Mark 2', brandId: 5 },
      { idModel: 7, modelName: 'dddfff', brandId: 6 },
      { idModel: 8, modelName: 'ndndn', brandId: 7 },
      { idModel: 9, modelName: 'ndndn', brandId: 8 },
      { idModel: 10, modelName: 'ndndn', brandId: 9 },
      { idModel: 11, modelName: 'ghhhrccr', brandId: 10 },
      { idModel: 12, modelName: 'ghhhrccr', brandId: 11 },
      { idModel: 13, modelName: 'yhhhhh', brandId: 12 },
      { idModel: 14, modelName: 'yhhhhh', brandId: 13 },
      { idModel: 15, modelName: 'Camry', brandId: 5 },
      { idModel: 16, modelName: 'hjsjsns', brandId: 14 },
    ],
  });

  await prisma.category.createMany({
    data: [
      { idCategory: 1, categoryName: 'Двигатель и смазочные материалы' },
      { idCategory: 2, categoryName: 'Диагностика и обслуживание' },
      { idCategory: 3, categoryName: 'Фильтры' },
    ],
  });

  await prisma.service.createMany({
    data: [
      {
        idService: 1,
        serviceName: 'Замена масла в ДВС',
        description:
          'Слив отработанного и заливка нового моторного масла с заменой масляного фильтра для продления срока службы двигателя.',
        price: 2000,
        categoryId: 1,
      },
      {
        idService: 2,
        serviceName: 'Диагностика компьютерная',
        description:
          'Подключение автомобиля к сканеру для считывания ошибок, проверки работы электронных систем и выявления неисправностей.',
        price: 2000,
        categoryId: 2,
      },
      {
        idService: 3,
        serviceName: 'Замена комплекта фильтров',
        description:
          'Полная замена воздушного, салонного и масляного фильтров для обеспечения корректной работы всех систем автомобиля.',
        price: 2000,
        categoryId: 3,
      },
      {
        idService: 4,
        serviceName: 'Масло 5w30',
        description:
          'Смазочный материал, подходящий для большинства современных двигателей — используется при замене масла.',
        price: 1600,
        categoryId: 1,
      },
      {
        idService: 6,
        serviceName: 'Замена комплекта ГРМ',
        description:
          'Полная замена ремня ГРМ и роликов — предотвращает обрыв ремня и серьезные повреждения двигателя.',
        price: 10000,
        categoryId: 1,
      },
      {
        idService: 7,
        serviceName: 'Мойка радиаторов',
        description:
          'Промывка радиаторов охлаждения и кондиционера от загрязнений для предотвращения перегрева и повышения эффективности.',
        price: 25000,
        categoryId: 2,
      },
      {
        idService: 9,
        serviceName: 'Замена топливного фильтра',
        description:
          'Обновление фильтра, очищающего топливо от загрязнений, для защиты двигателя и стабильной работы топливной системы.',
        price: 2000,
        categoryId: 3,
      },
      {
        idService: 10,
        serviceName: 'Дополнительные слесарные работы',
        description:
          'Выполнение мелких и нестандартных ремонтных работ по ходовой части и другим узлам автомобиля.',
        price: 3000,
        categoryId: 2,
      },
    ],
  });

  // Пользователи из дампа (bcrypt-хэши сохранены как есть).
  await prisma.user.createMany({
    data: [
      {
        id: 2,
        username: 'aaa',
        email: 'aaa@aaa.ru',
        passwordHash: '$2a$10$CocfiFWyjSb/XdWD8oHlLeaqCeXkAA/hMtrp9YDC.E6O/CD79jNS2',
      },
      {
        id: 9,
        username: 'Anna',
        email: 'cherrr@mail.ru',
        passwordHash: '$2a$10$zVB.lV5W7fkqoor2sIGaUeE1hhR3tFlvFLWWnIOA6gLTrlFh/YCu.',
        birthDate: date('2005-06-23'),
        phoneNumber: '+79281373959',
        linkImg: 'uploads/1772662727947-835962380.jpeg',
      },
      {
        id: 13,
        username: 'admin',
        email: 'carservice@admin-mail.ru',
        passwordHash: '$2a$10$TnA7IJDtid2CTKKyym7.qO75kxNoZ3M6SXfUW2JhFQVqpM.piCToK',
        isAdmin: true,
      },
      {
        id: 17,
        username: 'Anya',
        email: 'chera@mail.ru',
        passwordHash: '$2a$10$YzO2zMev2/zp.MJZ.2MU1uVRwDdYfle8yCyq9jik93ksBsb9ZdQaO',
        birthDate: date('2005-06-23'),
        phoneNumber: 'null',
      },
      {
        id: 20,
        username: 'Artem',
        email: 'lolkek@gmail.com',
        passwordHash: '$2a$10$DfTYgX8fE9Fn.0A4k6LS5eCBaK8UlzNfsmLZNTKjkpHXou/yui0xG',
      },
      {
        id: 21,
        username: 'FRGETB',
        email: 'noterror@mail.ru',
        passwordHash: '$2a$10$NK1bjaDZ.WIAbkLAoT2gJeVqrUNabJq9zzVOJU.tjiSUcoVFWfFBm',
      },
      {
        id: 22,
        username: 'testtest',
        email: 'testtest@mail.ru',
        passwordHash: '$2b$10$o9htC3s1x46FRHW.wW6g7uc/JNPZ07m5q/fMa4qghAFYjwNPyEtA6',
      },
    ],
  });

  // Демо-аккаунты для локальной разработки.
  await prisma.user.create({
    data: {
      username: 'Demo Admin',
      email: 'admin@ams.local',
      passwordHash: await bcrypt.hash('Admin12345', 10),
      isAdmin: true,
    },
  });

  await prisma.user.create({
    data: {
      username: 'Demo User',
      email: 'user@ams.local',
      passwordHash: await bcrypt.hash('User12345', 10),
    },
  });

  await prisma.car.createMany({
    data: [
      {
        id: 1,
        userId: 9,
        modelId: 1,
        year: 1970,
        mileage: 15001,
        vinCode: 'JT12345678901234',
        licensePlate: 'А123АА 177',
        linkImg: 'uploads/mark2.jpg',
      },
      {
        id: 6,
        userId: 2,
        modelId: 3,
        year: 2022,
        mileage: 35000,
        vinCode: 'WBAAA12345678901',
        licensePlate: 'М001ММ 77',
        linkImg: '',
      },
      {
        id: 9,
        userId: 17,
        modelId: 1,
        year: 1970,
        mileage: 11111,
      },
      {
        id: 13,
        userId: 9,
        modelId: 15,
        year: 2012,
        mileage: 6757,
        vinCode: 'JBAAA12345678901',
        licensePlate: 'B001AМ 77',
        linkImg: 'uploads/1745613070890-51639533.jpg',
      },
    ],
  });

  await prisma.order.create({
    data: {
      idOrder: 1,
      userId: 9,
      carId: 1,
      orderDate: '2024-12-28',
      orderTime: '14:30',
      totalPrice: 2000,
      status: OrderStatus.IN_PROGRESS,
      comment: 'Замена масла и диагностика',
      services: {
        create: [
          { serviceId: 2, price: 500 },
          { serviceId: 3, price: 1500 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      idOrder: 2,
      userId: 2,
      carId: 6,
      orderDate: '2024-12-12',
      orderTime: '15:00',
      totalPrice: 345,
      status: OrderStatus.IN_PROGRESS,
      comment: 'Проблемы с двигателем',
      services: { create: [{ serviceId: 4, price: 345 }] },
    },
  });

  await prisma.order.create({
    data: {
      idOrder: 31,
      userId: 9,
      carId: 1,
      orderDate: '2024-12-20',
      orderTime: '15:30',
      totalPrice: 100,
      status: OrderStatus.FINISHED,
      comment: 'help',
      doc: 'uploads/1773513861530-459359656.pdf',
      services: { create: [{ serviceId: 1, price: 100 }] },
    },
  });

  await prisma.order.create({
    data: {
      idOrder: 33,
      userId: 9,
      carId: 1,
      orderDate: '2025-03-19',
      orderTime: '05:25',
      totalPrice: 300,
      status: OrderStatus.COMPLETED,
      comment: 'rrrrr',
      services: {
        create: [
          { serviceId: 1, price: 100 },
          { serviceId: 2, price: 200 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      idOrder: 34,
      userId: 9,
      carId: 1,
      orderDate: '2026-03-10',
      orderTime: '10:00',
      totalPrice: 2000,
      status: OrderStatus.ACCEPTED,
      comment: 'help',
      services: { create: [{ serviceId: 1, price: 2000 }] },
    },
  });

  await prisma.order.create({
    data: {
      idOrder: 35,
      userId: 9,
      carId: 1,
      orderDate: '2026-03-05',
      orderTime: '18:47',
      totalPrice: 10000,
      status: OrderStatus.CREATED,
      comment: 'ggg',
      services: { create: [{ serviceId: 6, price: 10000 }] },
    },
  });

  await prisma.order.create({
    data: {
      idOrder: 37,
      userId: 9,
      carId: 13,
      orderDate: '2026-03-06',
      orderTime: '10:19',
      totalPrice: 2000,
      status: OrderStatus.FINISHED,
      comment: 'akskkskd',
      doc: 'uploads/1773513616895-13610412.pdf',
      services: { create: [{ serviceId: 1, price: 2000 }] },
    },
  });

  const counts = {
    users: await prisma.user.count(),
    cars: await prisma.car.count(),
    categories: await prisma.category.count(),
    services: await prisma.service.count(),
    orders: await prisma.order.count(),
    orderServices: await prisma.orderService.count(),
  };

  console.log('Seed завершён:', counts);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
