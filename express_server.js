const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

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
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 40px 20px;
      background: #f3f3f3;
      color: #2c3e50;
      font-family: Arial, sans-serif;
    }

    main {
      max-width: 760px;
      margin: 0 auto;
      padding: 40px 48px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }

    h1 {
      margin-top: 0;
      text-align: center;
    }

    h2 {
      margin-top: 32px;
    }

    p, li {
      font-size: 18px;
      line-height: 1.6;
    }

    a {
      color: #6a1b9a;
    }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    ${content}
  </main>
</body>
</html>`;

const formatDate = (date) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

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

app.use((req, res, next) => {
  const startedAt = new Date();
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${formatDate(startedAt)}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });

  next();
});

app.use(compression({ threshold: 0 }));

app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: true,
  handler: (req, res) => {
    res.status(429).json({ error: 'Слишком много запросов', status: 429 });
  }
}));

app.use(express.json());

app.get('/', (req, res) => {
  const now = new Date().toLocaleString('ru-RU');
  res.type('html').send(page('Лабораторная работа №16', `
  <p>Группа: 478</p>
  <p>Текущая дата и время: ${now}</p>
  <p>Добро пожаловать на сервер Express.js!</p>
  <h2>Доступные маршруты</h2>
  <ul>
    <li><a href="/">/</a></li>
    <li><a href="/about">/about</a></li>
    <li><a href="/contacts">/contacts</a></li>
    <li><a href="/api/books">/api/books</a></li>
    <li><a href="/api/books/search?author=Толстой">/api/books/search?author=Толстой</a></li>
    <li><a href="/error">/error</a></li>
    <li><a href="/async-error">/async-error</a></li>
  </ul>`));
});

app.get('/about', (req, res) => {
  res.type('html').send(page('О разработчике', `
  <p>Студент: Матеишин Никита</p>
  <p>Группа: 478</p>
  <p><a href="/">На главную</a></p>`));
});

app.get('/contacts', (req, res) => {
  res.type('html').send(page('Контакты', `
  <p>Email: nikitamateishin@gmail.com</p>
  <p>GitHub: github.com/nikitamateishin</p>
  <p><a href="/">На главную</a></p>`));
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

app.get('/error', (req, res) => {
  throw new Error('Тестовая ошибка');
});

app.get('/async-error', async (req, res) => {
  throw new Error('Асинхронная ошибка');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден', status: 404 });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Внутренняя ошибка сервера' : err.message;

  res.status(status).json({ error: message, status });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
