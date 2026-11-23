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
// БАЗОВЫЙ УРОВЕНЬ
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