const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

let books = [
  { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869 },
  { id: 2, title: 'Преступление и наказание', author: 'Достоевский', year: 1866 }
];
let nextBookId = 3;

const page = (title, content) => `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;

const isValidBook = (data, partial = false) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim() === '') {
      return false;
    }
  }

  if (!partial || data.author !== undefined) {
    if (typeof data.author !== 'string' || data.author.trim() === '') {
      return false;
    }
  }

  if (!partial || data.year !== undefined) {
    if (!Number.isInteger(data.year) || data.year < 1 || data.year > new Date().getFullYear()) {
      return false;
    }
  }

  if (partial && data.title === undefined && data.author === undefined && data.year === undefined) {
    return false;
  }

  return true;
};

app.use(express.json());

app.get('/', (req, res) => {
  const now = new Date().toLocaleString('ru-RU');
  res.type('html').send(page('Лабораторная работа №16', `
  <p>Студент: Матеишин Никита</p>
  <p>Группа: 478</p>
  <p>Дата и время: ${now}</p>
  <p>Добро пожаловать!</p>
  <h2>Доступные маршруты</h2>
  <ul>
    <li>GET /</li>
    <li>GET /about</li>
    <li>GET /contacts</li>
    <li>GET /api/books</li>
    <li>GET /api/books/:id</li>
    <li>POST /api/books</li>
    <li>PUT /api/books/:id</li>
    <li>DELETE /api/books/:id</li>
    <li>GET /api/books/search?author=Толстой</li>
  </ul>`));
});

app.get('/about', (req, res) => {
  res.type('html').send(page('О разработчике', `
  <p>Студент: Матеишин Никита</p>
  <p>Группа: 478</p>
  <p>Лабораторная работа №16</p>
  <p>Тема: создание сервера на Express.js</p>`));
});

app.get('/contacts', (req, res) => {
  res.type('html').send(page('Контакты', `
  <p>Email: nikita@example.com</p>
  <p>GitHub: github.com/nikitamateishin</p>`));
});

app.get('/api/books', (req, res) => {
  res.json(books);
});

app.get('/api/books/search', (req, res) => {
  const author = req.query.author;

  if (typeof author !== 'string' || author.trim() === '') {
    res.status(400).json({ error: 'Не указан автор', status: 400 });
    return;
  }

  const result = books.filter((book) => book.author.toLowerCase().includes(author.trim().toLowerCase()));
  res.json(result);
});

app.get('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((item) => item.id === id);

  if (!book) {
    res.status(404).json({ error: 'Книга не найдена', status: 404 });
    return;
  }

  res.json(book);
});

app.post('/api/books', (req, res) => {
  const data = req.body;

  if (!isValidBook(data)) {
    res.status(400).json({ error: 'Некорректные данные', status: 400 });
    return;
  }

  const book = {
    id: nextBookId++,
    title: data.title.trim(),
    author: data.author.trim(),
    year: data.year
  };

  books.push(book);
  res.status(201).json(book);
});

app.put('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((item) => item.id === id);

  if (!book) {
    res.status(404).json({ error: 'Книга не найдена', status: 404 });
    return;
  }

  const data = req.body;

  if (!isValidBook(data, true)) {
    res.status(400).json({ error: 'Некорректные данные', status: 400 });
    return;
  }

  if (data.title !== undefined) {
    book.title = data.title.trim();
  }

  if (data.author !== undefined) {
    book.author = data.author.trim();
  }

  if (data.year !== undefined) {
    book.year = data.year;
  }

  res.json(book);
});

app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex((item) => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Книга не найдена', status: 404 });
    return;
  }

  books.splice(index, 1);
  res.json({ message: 'Книга удалена' });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
