const fs = require('fs');
const VARIANT = 12;                 
const FULL_NAME = 'Матеишин Никита';   
const GROUP = '478';           

const favorites = [
  'ОНО - С. Кинг',
  'Бойцовский Клуб - Д. Финчер',
  'Мастер и Маргарита - М. Булгаков',
  'Остров проклятых — М. Скорсезе',
  'Гарри Поттер - Дж. Роулинг'
];

const fileName = `student_${VARIANT}.txt`;
const now = new Date();
const dateTimeStr = now.toLocaleString('ru-RU');
const lines = [
  `Фамилия и имя студента: ${FULL_NAME}`,
  `Номер группы: ${GROUP}`,
  `Номер варианта: ${VARIANT}`,
  `Текущая дата и время: ${dateTimeStr}`,
  'Список любимых книг/фильмов:',
  ...favorites.map((item, i) => `${i + 1}. ${item}`)
];

fs.writeFileSync(fileName, lines.join('\n') + '\n', 'utf8');

let content = fs.readFileSync(fileName, 'utf8');
let currentLines = content.split('\n').filter(l => l.length > 0);
const recordCount = currentLines.length;

fs.appendFileSync(fileName, `Количество записей: ${recordCount}\n`, 'utf8');

const finalContent = fs.readFileSync(fileName, 'utf8');
const finalLines = finalContent.split('\n').filter(l => l.length > 0);

console.log('-'.repeat(50));
console.log(`Содержимое файла: ${fileName}`);
console.log('-'.repeat(50));
finalLines.forEach((line, index) => {
  console.log(`${String(index + 1).padStart(2, '0')} | ${line}`);
});
console.log('-'.repeat(50));

