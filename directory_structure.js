const fs = require('fs');
const path = require('path');

const VARIANT = 12;                 
const ROOT = `project_${VARIANT}`;  

const folderDescriptions = {
  '.': 'Корневая папка проекта.',
  'src': 'Исходный код проекта.',
  'src/modules': 'Модули приложения (бизнес-логика).',
  'src/components': 'Компоненты интерфейса.',
  'src/utils': 'Вспомогательные утилиты и функции.',
  'data': 'Данные, используемые приложением.',
  'data/input': 'Входные данные для обработки.',
  'data/output': 'Результаты обработки данных.',
  'temp': 'Временные файлы.'
};



function createFolders() {
  Object.keys(folderDescriptions).forEach((relPath) => {
    const fullPath = path.join(ROOT, relPath);
    fs.mkdirSync(fullPath, { recursive: true });
  });
}

function createInfoFiles() {
  Object.entries(folderDescriptions).forEach(([relPath, description]) => {
    const fullPath = path.join(ROOT, relPath, 'info.txt');
    fs.writeFileSync(fullPath, `Назначение папки: ${description}\n`, 'utf8');
  });
}


function createReadmeFiles() {
  const dateStr = new Date().toLocaleString('ru-RU');
  Object.keys(folderDescriptions).forEach((relPath) => {
    const fullPath = path.join(ROOT, relPath, 'README.md');
    const folderName = relPath === '.' ? ROOT : relPath;
    fs.writeFileSync(
      fullPath,
      `# ${folderName}\n\nДата создания: ${dateStr}\n`,
      'utf8'
    );
  });
}


function printTree(dirPath, prefix = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    console.log(prefix + connector + entry.name + (entry.isDirectory() ? '/' : ''));

    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      printTree(path.join(dirPath, entry.name), newPrefix);
    }
  });
}

function printFullTree(title) {
  console.log('-'.repeat(50));
  console.log(title);
  console.log('-'.repeat(50));
  console.log(ROOT + '/');
  printTree(ROOT);
  console.log('');
}

createFolders();
createInfoFiles();

createReadmeFiles();

printFullTree('Структура дерева:');

fs.renameSync(path.join(ROOT, 'temp'), path.join(ROOT, 'data', 'temp'));

fs.renameSync(path.join(ROOT, 'data', 'output'), path.join(ROOT, 'data', 'results'));

fs.rmSync(path.join(ROOT, 'data', 'temp'), { recursive: true, force: true });


