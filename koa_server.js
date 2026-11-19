const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = 3000;

let users = [
  { id: 1, name: 'Матеишин Никита', group: '478' }
];
let nextId = 2;

const isValidUser = (data) => {
  return data
    && typeof data.name === 'string'
    && data.name.trim() !== ''
    && typeof data.group === 'string'
    && data.group.trim() !== '';
};

router.get('/', async (ctx) => {
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
});

router.get('/api/users', async (ctx) => {
  ctx.body = users;
});

router.post('/api/users', async (ctx) => {
  const data = ctx.request.body;

  if (!isValidUser(data)) {
    ctx.status = 400;
    ctx.body = { error: 'Некорректные данные' };
    return;
  }

  const user = {
    id: nextId++,
    name: data.name.trim(),
    group: data.group.trim()
  };

  users.push(user);
  ctx.status = 201;
  ctx.body = user;
});

router.put('/api/users/:id', async (ctx) => {
  const id = Number(ctx.params.id);
  const user = users.find((item) => item.id === id);

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'Пользователь не найден' };
    return;
  }

  const data = ctx.request.body;

  if (!isValidUser(data)) {
    ctx.status = 400;
    ctx.body = { error: 'Некорректные данные' };
    return;
  }

  user.name = data.name.trim();
  user.group = data.group.trim();
  ctx.body = user;
});

router.delete('/api/users/:id', async (ctx) => {
  const id = Number(ctx.params.id);
  const index = users.findIndex((item) => item.id === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Пользователь не найден' };
    return;
  }

  users.splice(index, 1);
  ctx.body = { message: 'Пользователь удален' };
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
