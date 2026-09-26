const fs = require('fs');
const path = require('path');

const VARIANT = 12;
const reportFileName = `report_${VARIANT}.json`;

const ALLOWED_EXTENSIONS = new Set(['.js', '.json', '.txt', '.md']);

const targetDir = process.argv[2] || process.cwd();

if (!fs.existsSync(targetDir)) {
  console.error(`Ошибка: директория "${targetDir}" не найдена.`);
  process.exit(1);
}

let totalFiles = 0;
let totalFolders = 0;
let totalSize = 0;

const allFiles = [];              
const extensionGroups = {};       
function scanDirectory(dirPath) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    console.error(`Не удалось прочитать папку "${dirPath}": ${err.message}`);
    return;
  }

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      totalFolders += 1;
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase() || '(без расширения)';

      
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return;
      }

      let stats;
      try {
        stats = fs.statSync(fullPath);
      } catch (err) {
        console.error(`Не удалось получить данные о файле "${fullPath}": ${err.message}`);
        return;
      }

      totalFiles += 1;
      totalSize += stats.size;

      const fileInfo = {
        path: fullPath,
        name: entry.name,
        size: stats.size,
        ext
      };

      allFiles.push(fileInfo);

      if (!extensionGroups[ext]) {
        extensionGroups[ext] = [];
      }
      extensionGroups[ext].push(fileInfo);
    }
  });
}

scanDirectory(targetDir);


function formatSize(bytes) {
  return {
    bytes,
    kb: +(bytes / 1024).toFixed(2),
    mb: +(bytes / (1024 * 1024)).toFixed(2)
  };
}

const groupedByExtension = {};
Object.keys(extensionGroups).forEach((ext) => {
  groupedByExtension[ext] = extensionGroups[ext].map((f) => ({
    name: f.name,
    path: f.path,
    size: f.size
  }));
});

const sortedBySize = [...allFiles].sort((a, b) => b.size - a.size);
const top5Largest = sortedBySize.slice(0, 5).map((f) => ({
  name: f.name,
  path: f.path,
  size: f.size
}));
const top5Smallest = sortedBySize.slice(-5).reverse().map((f) => ({
  name: f.name,
  path: f.path,
  size: f.size
}));

const report = {
  variant: VARIANT,
  scannedDirectory: path.resolve(targetDir),
  scanDate: new Date().toLocaleString('ru-RU'),
  allowedExtensions: Array.from(ALLOWED_EXTENSIONS),
  totalFiles,
  totalFolders,
  totalSize: formatSize(totalSize),
  filesByExtension: groupedByExtension,
  top5Largest,
  top5Smallest
};

fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2), 'utf8');

console.log('-'.repeat(60));
console.log(`Статистика по директории: ${path.resolve(targetDir)}`);
console.log('-'.repeat(60));
console.log(`Анализируются только расширения: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`);
console.log(`Общее количество файлов: ${totalFiles}`);
console.log(`Общее количество папок: ${totalFolders}`);
console.log(
  `Общий размер файлов: ${totalSize} байт (${formatSize(totalSize).kb} КБ / ${formatSize(totalSize).mb} МБ)`
);

console.log('\nФайлы по типам (расширениям):');
Object.keys(groupedByExtension)
  .sort()
  .forEach((ext) => {
    console.log(`  ${ext}: ${groupedByExtension[ext].length} файл(ов)`);
  });

console.log('\nТоп-5 самых больших файлов:');
top5Largest.forEach((f, i) => {
  console.log(`  ${i + 1}. ${f.name} — ${f.size} байт (${f.path})`);
});

console.log('\nТоп-5 самых маленьких файлов:');
top5Smallest.forEach((f, i) => {
  console.log(`  ${i + 1}. ${f.name} — ${f.size} байт (${f.path})`);
});

console.log('\n' + '-'.repeat(60));
console.log(`Отчёт сохранён в файл: ${reportFileName}`);
console.log('-'.repeat(60));
