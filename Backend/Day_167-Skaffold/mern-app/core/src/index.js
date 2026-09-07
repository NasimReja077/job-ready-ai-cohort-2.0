import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/number', (req, res) => {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  res.json({ number: randomNumber });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
