const express = require('express');
const app = express();
const port = 3000;

// Обязательный middleware, чтобы сервер понимал JSON из тела запроса
app.use(express.json());

// ============ ХРАНИЛИЩЕ ДАННЫХ В ПАМЯТИ ============
let cars = [
    { id: 1, brand: 'Toyota', model: 'Camry' },
    { id: 2, brand: 'BMW', model: 'X5' },
    { id: 3, brand: 'Lada', model: 'Vesta' }
];

// Счётчик для генерации новых ID
let nextId = 4;

// ============ CRUD-ОПЕРАЦИИ ============

// 1. GET /cars - получить все автомобили (READ)
app.get('/cars', (req, res) => {
    res.json({
        count: cars.length,
        cars: cars
    });
});

// 2. GET /cars/:id - получить один автомобиль по ID (READ)
app.get('/cars/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const car = cars.find(c => c.id === id);

    if (!car) {
        // Если не нашли - возвращаем 404
        return res.status(404).json({ error: 'Автомобиль не найден' });
    }
    res.json(car);
});

// 3. POST /cars - добавить новый автомобиль (CREATE)
app.post('/cars', (req, res) => {
    const { brand, model } = req.body;

    // Простейшая валидация: проверяем, что поля переданы
    if (!brand || !model) {
        return res.status(400).json({ error: 'Поля brand и model обязательны' });
    }

    const newCar = {
        id: nextId++, // Берем текущий ID и увеличиваем счетчик
        brand: brand,
        model: model
    };

    cars.push(newCar); // Добавляем в массив
    // Возвращаем код 201 (Created) и сам объект
    res.status(201).json(newCar);
});

// 4. PUT /cars/:id - обновить автомобиль (UPDATE)
app.put('/cars/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = cars.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    const { brand, model } = req.body;
    
    // Обновляем данные (если поле не передано, оставляем старое)
    cars[index] = {
        id: id,
        brand: brand || cars[index].brand,
        model: model || cars[index].model
    };

    res.json(cars[index]);
});

// 5. DELETE /cars/:id - удалить автомобиль (DELETE)
app.delete('/cars/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = cars.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    // Удаляем 1 элемент начиная с индекса index
    const deletedCar = cars.splice(index, 1)[0]; 

        res.status(204).send();
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});