const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
