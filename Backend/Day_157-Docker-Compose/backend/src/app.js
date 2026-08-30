import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World');
});

app.get('/api/data', (req, res) => {
    const data = {
        message: 'This is some sample data from the API.',
        timestamp: new Date(),
    };
    res.json(data);
});

app.get('/api/users', (req, res) => {
    const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Nasim' },
    ];
    res.json(users);
});

app.get('/api/cars', (req, res) => {
    const cars = [
        { id: 1, name: 'BMW' },
        { id: 2, name: 'VOLVO' },
        { id: 3, name: 'TATA' },
    ];
    res.json(cars);
});

app.get('/api/citys', (req, res) => {
    const citys = [
        { id: 1, name: 'KOLKATA' },
        { id: 2, name: 'TOKIO' },
        { id: 3, name: 'NY' },
    ];
    res.json(citys);
});

export default app;