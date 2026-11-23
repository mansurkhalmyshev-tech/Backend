# Лабораторная работа №3: Маршрутизация, параметры пути и query-параметры

**Студент:** Халмышев Мансур Асланбекович  
**Группа:** ПИЖ-б-о-25-1  
**Вариант:** 10  
**Уровень:** Средний  
**Технология:** Node.js + Express, Яндекс Браузер / Postman  

## Содержание
- [Лабораторная работа №3: Маршрутизация, параметры пути и query-параметры](#лабораторная-работа-3-маршрутизация-параметры-пути-и-query-параметры)
  - [Содержание](#содержание)
  - [Цель работы](#цель-работы)
  - [Теоретическое обоснование](#теоретическое-обоснование)
  - [Выполнение индивидуального задания (Вариант 10 — Автомобили)](#выполнение-индивидуального-задания-вариант-10--автомобили)
    - [Инициализация проекта и запуск сервера](#инициализация-проекта-и-запуск-сервера)
    - [Код сервера (app.js)](#код-сервера-appjs)
    - [Демонстрация работы API](#демонстрация-работы-api)
      - [1. Получение всех автомобилей (`GET /cars`)](#1-получение-всех-автомобилей-get-cars)
      - [2. Получение одного автомобиля по ID (`GET /cars/:id`)](#2-получение-одного-автомобиля-по-id-get-carsid)
      - [3. Ошибка валидации ID (`GET /cars/abc` — 400 Bad Request)](#3-ошибка-валидации-id-get-carsabc--400-bad-request)
      - [4. Ресурс не найден (`GET /cars/999` — 404 Not Found)](#4-ресурс-не-найден-get-cars999--404-not-found)
      - [5. Вложенный ресурс: владельцы (`GET /cars/:id/owners`)](#5-вложенный-ресурс-владельцы-get-carsidowners)
      - [6. Фильтрация по категории (`GET /brands/:brand/cars`)](#6-фильтрация-по-категории-get-brandsbrandcars)
      - [7. Ошибка поиска по категории (`GET /brands/Lada/cars` — 404 Not Found)](#7-ошибка-поиска-по-категории-get-brandslaдacars--404-not-found)
      - [8. Поиск и фильтрация по марке (`GET /cars?brand=Toyota`)](#8-поиск-и-фильтрация-по-марке-get-carsbrandtoyota)
      - [9. Фильтрация по году выпуска (`GET /cars?minYear=2021`)](#9-фильтрация-по-году-выпуска-get-carsminyear2021)
      - [10. Сортировка по убыванию цены (`GET /cars?sort=price&order=desc`)](#10-сортировка-по-убыванию-цены-get-carssortpriceorderdesc)
      - [11. Ошибка валидации поля сортировки (`GET /cars?sort=color` — 400 Bad Request)](#11-ошибка-валидации-поля-сортировки-get-carssortcolor--400-bad-request)
      - [12. Пагинация (`GET /cars?page=1&limit=2`)](#12-пагинация-get-carspage1limit2)
      - [13. Обработка несуществующего маршрута (`Wildcard 404`)](#13-обработка-несуществующего-маршрута-wildcard-404)
  - [Ответы на контрольные вопросы (средний уровень)](#ответы-на-контрольные-вопросы-средний-уровень)
  - [Выводы](#выводы)
  - [Список использованных источников](#список-использованных-источников)
  - [Ссылка на репозиторий](#ссылка-на-репозиторий)

---

## Цель работы
Освоить различные способы передачи данных через URL. Научиться строить гибкие маршруты с параметрами пути (`req.params`) и query-параметрами (`req.query`), комбинировать их, обрабатывать вложенные ресурсы и валидировать входные данные. Понять разницу между `req.params`, `req.query` и `req.body`.

---

## Теоретическое обоснование

**Маршрутизация (routing)** — это механизм сопоставления HTTP-запроса (метод + URL) с функцией-обработчиком на сервере. В Express маршрут описывается как `app.METHOD(PATH, HANDLER)`, где `METHOD` — HTTP-метод (`get`, `post`, `put`, `delete`), а порядок объявления маршрутов определяет их приоритет.

**Источники данных в URL:**
* **Параметры пути (`req.params`)** — именованные сегменты URL (например, `/cars/:id`), используемые для идентификации конкретного ресурса. Всегда приходят в виде строки.
* **Query-параметры (`req.query`)** — пары `ключ=значение` после знака `?` (например, `/cars?brand=BMW&sort=price`). Используются для поиска, фильтрации, сортировки и пагинации.

**Вложенные маршруты и валидация.** Вложенные маршруты отражают иерархию данных (например, `/cars/:id/owners` — владельцы конкретного автомобиля). Поскольку все параметры из URL поступают как строки, обязательна их валидация: проверка числовых значений через `parseInt` и `isNaN`, проверка полей сортировки по белому списку и возврат статуса **400 Bad Request** при некорректном запросе.

---

## Выполнение индивидуального задания (Вариант 10 — Автомобили)

**Сущность:** Автомобили (`cars`).  
**Поля:** `id`, `brand`, `model`, `year`, `price`.  
**Вложенный ресурс:** `/cars/:id/owners` (владельцы автомобиля).  
**Категория:** `/brands/:brand/cars` (автомобили определённой марки).  
**Поля сортировки:** `id`, `brand`, `model`, `year`, `price`.  
**Поля фильтрации:** `brand`, `minYear`.  

### Инициализация проекта и запуск сервера
Проект был инициализирован с помощью `npm init -y`. Установлены зависимости `express` (`^5.3.0`) и `nodemon` (`^3.1.14`). В `package.json` настроены скрипты запуска:
```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```
Запуск сервера в режиме разработки с автоперезапуском выполняется командой `npm run dev`.

### Код сервера (app.js)

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// ===== Логирование запросов =====
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ===== ДАННЫЕ: автомобили (5 шт.) =====
let cars = [
    { id: 1, brand: 'BMW',    model: 'X5',    year: 2020, price: 5500000 },
    { id: 2, brand: 'BMW',    model: 'M3',    year: 2021, price: 7200000 },
    { id: 3, brand: 'Audi',   model: 'A6',    year: 2019, price: 4800000 },
    { id: 4, brand: 'Toyota', model: 'Camry', year: 2020, price: 3200000 },
    { id: 5, brand: 'Toyota', model: 'Land Cruiser', year: 2023, price: 9500000 }
];

// ===== Владельцы автомобилей (вложенный ресурс) =====
const ownersData = {
    1: [{ id: 1, name: 'Иван Петров',    year: 2019 }],
    2: [{ id: 2, name: 'Алексей Кузнецов', year: 2021 }],
    3: [{ id: 3, name: 'Дмитрий Попов',   year: 2020 }],
    4: [{ id: 4, name: 'Михаил Лебедев',  year: 2020 }],
    5: [{ id: 5, name: 'Николай Козлов',  year: 2023 }]
};

// ===== Вспомогательная функция: безопасный парсинг id =====
function parseId(raw) {
    const id = parseInt(raw, 10);
    if (isNaN(id) || id < 1) return null;
    return id;
}

// ============================================================
// БАЗОВЫЙ И СРЕДНИЙ УРОВНИ
// ============================================================

// GET /cars — все автомобили + поиск + фильтр + сортировка + пагинация
app.get('/cars', (req, res) => {
    let result = [...cars];

    // Поиск по модели или марке
    const search = req.query.search;
    if (search) {
        const s = search.toLowerCase();
        result = result.filter(c =>
            c.brand.toLowerCase().includes(s) ||
            c.model.toLowerCase().includes(s)
        );
    }

    // Фильтр по марке
    const brand = req.query.brand;
    if (brand) {
        result = result.filter(c => c.brand.toLowerCase() === brand.toLowerCase());
    }

    // Фильтр по году (>=)
    const minYear = req.query.minYear;
    if (minYear) {
        const y = parseInt(minYear, 10);
        if (isNaN(y)) {
            return res.status(400).json({ error: 'minYear должен быть числом' });
        }
        result = result.filter(c => c.year >= y);
    }

    // Сортировка
    const sort = req.query.sort;
    const order = req.query.order || 'asc';
    const allowedSortFields = ['id', 'brand', 'model', 'year', 'price'];

    if (sort) {
        if (!allowedSortFields.includes(sort)) {
            return res.status(400).json({
                error: `Поле сортировки должно быть одним из: ${allowedSortFields.join(', ')}`
            });
        }
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({ error: 'Параметр order должен быть asc или desc' });
        }
        result.sort((a, b) => {
            if (order === 'desc') return a[sort] < b[sort] ? 1 : -1;
            return a[sort] > b[sort] ? 1 : -1;
        });
    }

    // Пагинация
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    if (page < 1) {
        return res.status(400).json({ error: 'page должен быть >= 1' });
    }
    if (limit < 1 || limit > 100) {
        return res.status(400).json({ error: 'limit должен быть от 1 до 100' });
    }

    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    res.json({
        count: result.length,
        page,
        limit,
        totalPages: Math.ceil(result.length / limit),
        cars: paginated
    });
});

// GET /cars/:id — один автомобиль
app.get('/cars/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: 'ID должен быть положительным числом' });
    }

    const car = cars.find(c => c.id === id);
    if (!car) {
        return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    res.json(car);
});

// GET /cars/:id/owners — владельцы автомобиля (вложенный ресурс)
app.get('/cars/:id/owners', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: 'ID должен быть положительным числом' });
    }

    const car = cars.find(c => c.id === id);
    if (!car) {
        return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    const owners = ownersData[id] || [];
    res.json({
        car: `${car.brand} ${car.model}`,
        count: owners.length,
        owners
    });
});

// GET /brands/:brand/cars — автомобили марки (категория)
app.get('/brands/:brand/cars', (req, res) => {
    const brand = req.params.brand;
    const filtered = cars.filter(c => c.brand.toLowerCase() === brand.toLowerCase());

    if (filtered.length === 0) {
        return res.status(404).json({ error: `Марка "${brand}" не найдена` });
    }

    res.json({
        brand,
        count: filtered.length,
        cars: filtered
    });
});

// ============================================================
// WILDCARD / 404 — ВСЕГДА ПОСЛЕДНИМ
// ============================================================
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// ===== Запуск сервера =====
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
```

---

### Демонстрация работы API

> **Примечание для репозитория:** сохраните ваши скриншоты в папку `screenshots/` с указанными ниже именами файлов (`cars-all.png`, `car-by-id.png` и т.д.), чтобы они корректно отображались на GitHub.

#### 1. Получение всех автомобилей (`GET /cars`)
Запрос: `GET http://localhost:3000/cars`  
Возвращает полный список из 5 автомобилей с метаданными пагинации (`count: 5`, `page: 1`, `limit: 10`, `totalPages: 1`).  
![cars-all](screenshots/cars-all.png)

#### 2. Получение одного автомобиля по ID (`GET /cars/:id`)
Запрос: `GET http://localhost:3000/cars/1`  
Возвращает объект автомобиля BMW X5 (`id: 1`) с кодом `200 OK`.  
![car-by-id](screenshots/car-by-id.png)

#### 3. Ошибка валидации ID (`GET /cars/abc` — 400 Bad Request)
Запрос: `GET http://localhost:3000/cars/abc`  
Функция `parseId` проверяет параметр пути и при передаче нечислового значения возвращает статус `400 Bad Request` с текстом `ID должен быть положительным числом`.  
![car-400](screenshots/car-400.png)

#### 4. Ресурс не найден (`GET /cars/999` — 404 Not Found)
Запрос: `GET http://localhost:3000/cars/999`  
Автомобиль с указанным ID отсутствует в массиве, сервер возвращает статус `404 Not Found` с сообщением `Автомобиль не найден`.  
![car-404](screenshots/car-404.png)

#### 5. Вложенный ресурс: владельцы (`GET /cars/:id/owners`)
Запрос: `GET http://localhost:3000/cars/1/owners`  
Возвращает информацию об автомобиле (`BMW X5`) и список его владельцев из `ownersData` (`Иван Петров`).  
![car-owners](screenshots/car-owners.png)

#### 6. Фильтрация по категории (`GET /brands/:brand/cars`)
Запрос: `GET http://localhost:3000/brands/BMW/cars`  
Возвращает все автомобили марки BMW (`X5` и `M3`, `count: 2`).  
![brand-cars](screenshots/brand-cars.png)

#### 7. Ошибка поиска по категории (`GET /brands/Lada/cars` — 404 Not Found)
Запрос: `GET http://localhost:3000/brands/Lada/cars`  
При передаче марки, отсутствующей в данных, сервер возвращает статус `404 Not Found` (`Марка "Lada" не найдена`).  
![brand-404](screenshots/brand-404.png)

#### 8. Поиск и фильтрация по марке (`GET /cars?brand=Toyota`)
Запрос: `GET http://localhost:3000/cars?brand=Toyota`  
Возвращает отфильтрованный список автомобилей марки Toyota (`Camry` и `Land Cruiser`, `count: 2`).  
![filter-brand](screenshots/filter-brand.png)

#### 9. Фильтрация по году выпуска (`GET /cars?minYear=2021`)
Запрос: `GET http://localhost:3000/cars?minYear=2021`  
Фильтрует коллекцию по условию `year >= 2021` (возвращает `BMW M3` 2021 г. и `Toyota Land Cruiser` 2023 г.).  
![filter-year](screenshots/filter-year.png)

#### 10. Сортировка по убыванию цены (`GET /cars?sort=price&order=desc`)
Запрос: `GET http://localhost:3000/cars?sort=price&order=desc`  
Сортирует весь список автомобилей по убыванию стоимости (от `9 500 000` до `3 200 000`).  
![sort-price](screenshots/sort-price.png)

#### 11. Ошибка валидации поля сортировки (`GET /cars?sort=color` — 400 Bad Request)
Запрос: `GET http://localhost:3000/cars?sort=color`  
Поле `color` отсутствует в белом списке `allowedSortFields`, поэтому сервер отклоняет запрос со статусом `400 Bad Request`.  
![sort-400](screenshots/sort-400.png)

#### 12. Пагинация (`GET /cars?page=1&limit=2`)
Запрос: `GET http://localhost:3000/cars?page=1&limit=2`  
Возвращает 1-ю страницу списка по 2 элемента на страницу (`totalPages: 3`).  
![pagination](screenshots/pagination.png)

#### 13. Обработка несуществующего маршрута (`Wildcard 404`)
Запрос: `GET http://localhost:3000/unknown-route`  
Замыкающий middleware `app.use(...)` перехватывает обращение к любому неопределённому адресу и возвращает `404 Not Found` (`Маршрут не найден`).  
![wildcard-404](screenshots/wildcard-404.png)

---

## Ответы на контрольные вопросы (средний уровень)

1. **Как получить query-параметры в Express/Flask? Чем они отличаются от параметров пути?**  
   В Express query-параметры извлекаются из объекта `req.query` (например, `req.query.brand`), а во Flask — через `request.args.get('brand')`. В отличие от параметров пути (`req.params`), которые являются обязательной частью структуры URL для идентификации ресурса (`/cars/1`), query-параметры передаются после знака `?` и обычно являются опциональными (используются для фильтрации, сортировки, поиска и пагинации).

2. **Как задать значение по умолчанию для query-параметра?**  
   В Express используют оператор логического ИЛИ (`||`) или оператор нулевого слияния (`??`), например: `const order = req.query.order || 'asc';`. Во Flask значение передаётся вторым аргументом в метод `get()`: `request.args.get('order', default='asc')`.

3. **Как реализовать поиск по подстроке через query-параметр?**  
   Необходимо привести искомый параметр `req.query.search` и проверяемое строковое поле объекта к нижнему регистру (`.toLowerCase()`), после чего отфильтровать коллекцию методом `.filter()` с проверкой вхождения подстроки через `.includes()`.

4. **Как реализовать пагинацию с подсчётом общего количества страниц?**  
   Начальный индекс вычисляется по формуле `start = (page - 1) * limit`, срез данных получается через `result.slice(start, start + limit)`, а общее количество страниц вычисляется округлением вверх: `totalPages = Math.ceil(result.length / limit)`.

5. **Как валидировать query-параметры? Какие коды ответов использовать?**  
   Числовые параметры (`page`, `limit`, `minYear`) приводятся через `parseInt()` и проверяются через `isNaN()` и сравнение границ (`page >= 1`, `1 <= limit <= 100`). Строковые параметры (`sort`, `order`) сверяются с заранее заданным массивом разрешённых значений (белым списком). При нарушении правил сервер возвращает статус **400 Bad Request**.

6. **Что произойдёт, если query-параметр передан несколько раз (`?tag=js&tag=node`)?**  
   В Express парсер строк запроса автоматически преобразует такое значение в массив строк: `req.query.tag` будет равен `['js', 'node']`.

7. **Как ограничить максимальное значение `limit`?**  
   Добавить условие проверки: если `limit < 1 || limit > 100`, прервать выполнение обработчика и вернуть ответ со статусом `400 Bad Request` (либо принудительно ограничивать значение через `Math.min(limit, 100)`).

8. **Как использовать белый список полей для сортировки?**  
   Создать массив допустимых названий полей (`const allowedSortFields = ['id', 'brand', 'model', 'year', 'price']`) и перед сортировкой проверять наличие переданного параметра `sort` в этом массиве с помощью метода `.includes(sort)`. Это защищает сервер от попыток сортировки по несуществующим или служебным свойствам объекта.

---

## Выводы
В ходе выполнения лабораторной работы №3 были изучены и практически применены механизмы маршрутизации в фреймворке Express:

* Реализованы маршруты с параметрами пути (`req.params`) для получения конкретного автомобиля (`/cars/:id`), вложенного ресурса (`/cars/:id/owners`) и фильтрации по категории (`/brands/:brand/cars`).
* Внедрена обработка query-параметров (`req.query`) для поиска (`search`), фильтрации (`brand`, `minYear`), сортировки (`sort`, `order`) и пагинации (`page`, `limit`).
* Настроена строгая валидация входных данных с использованием белого списка полей сортировки и безопасного парсинга чисел, а также обработка ошибок `400 Bad Request` и `404 Not Found` (включая wildcard-маршрут в конце файла).
* Все эндпоинты протестированы, поведение сервера проверено как для валидных, так и для некорректных запросов.

---

## Список использованных источников
1. Express — Routing: https://expressjs.com/en/guide/routing.html
2. Express — Request API (`req.params`, `req.query`): https://expressjs.com/en/4x/api.html#req
3. MDN Web Docs — HTTP-методы: https://developer.mozilla.org/ru/docs/Web/HTTP/Methods
4. REST API Tutorial: https://restfulapi.net/

---

## Ссылка на репозиторий
https://github.com/mansurkhalmyshev-tech/Backend
