const Koa = require('koa');

const app = new Koa();
const PORT = 3000;

app.use(async (ctx) => {
  if (ctx.method === 'GET' && ctx.path === '/') {
    const now = new Date().toLocaleString('ru-RU');
    ctx.type = 'html';
    ctx.body = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Лабораторная работа №15</title>
</head>
<body>
  <h1>Лабораторная работа №15</h1>
  <p>Студент: Матеишин Никита</p>
  <p>Группа: 478</p>
  <p>Дата и время: ${now}</p>
  <p>Добро пожаловать!</p>
</body>
</html>`;
    return;
  }

  ctx.status = 404;
  ctx.body = 'Not Found';
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
