const fs = require('fs');
const path = require('path');
const readline = require('readline');

const VARIANT = 12;
const inputFile = `data_${VARIANT}.txt`;
const outputFile = `processed_${VARIANT}.txt`;
const filteredFile = `above500_${VARIANT}.txt`;

const MIN_LINES = 100000;
const HIGH_WATER_MARK = 64 * 1024; 

function formatNumber(n) {
  return n.toLocaleString('en-US');
}

function formatSize(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} МБ`;
}

function generateFileIfNeeded() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(inputFile)) {
      console.log(`Файл ${inputFile} уже существует, генерация пропущена.\n`);
      resolve();
      return;
    }

    console.log(
      `Файл ${inputFile} не найден. Генерация ${formatNumber(MIN_LINES)} строк...`
    );

    const writeStream = fs.createWriteStream(inputFile, {
      highWaterMark: HIGH_WATER_MARK
    });

    const BATCH_SIZE = 5000;
    let buffer = '';

    for (let i = 1; i <= MIN_LINES; i++) {
      const randomNumber = Math.floor(Math.random() * 1000) + 1;
      buffer += `${i}, ${randomNumber}, Вариант ${VARIANT}\n`;

      if (i % BATCH_SIZE === 0) {
        writeStream.write(buffer);
        buffer = '';
      }
    }

    if (buffer.length > 0) {
      writeStream.write(buffer);
    }

    writeStream.end();
    writeStream.on('finish', () => {
      console.log('Генерация файла завершена.\n');
      resolve();
    });
    writeStream.on('error', reject);
  });
}


function processFile() {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(inputFile);
    const totalSize = stats.size;

    console.log(`Обработка файла: ${inputFile}`);
    console.log(`Размер файла: ${formatSize(totalSize)}`);

    const startTime = process.hrtime.bigint();

    const readStream = fs.createReadStream(inputFile, {
      highWaterMark: HIGH_WATER_MARK,
      encoding: 'utf8'
    });

    const filteredStream = fs.createWriteStream(filteredFile, {
      highWaterMark: HIGH_WATER_MARK
    });

    let bytesRead = 0;
    let lastPercentPrinted = 0;
    let leftover = '';

    let count = 0;
    let sum = 0;
    let max = -Infinity;
    let min = Infinity;

    function processLine(line) {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(',');
      if (parts.length < 2) return;

      const number = parseInt(parts[1].trim(), 10);
      if (Number.isNaN(number)) return;

      count += 1;
      sum += number;
      if (number > max) max = number;
      if (number < min) min = number;

      
      if (number > 500) {
        filteredStream.write(trimmed + '\n');
      }
    }

    readStream.on('data', (chunk) => {
      bytesRead += Buffer.byteLength(chunk, 'utf8');

      const data = leftover + chunk;
      const lines = data.split('\n');
      leftover = lines.pop(); 

      lines.forEach(processLine);

      const percent = Math.floor((bytesRead / totalSize) * 100);
      while (lastPercentPrinted + 10 <= percent && lastPercentPrinted < 100) {
        lastPercentPrinted += 10;
        console.log(
          `Прогресс: ${lastPercentPrinted}% (${formatNumber(count)} строк обработано)`
        );
      }
    });

    readStream.on('end', () => {
      if (leftover.length > 0) {
        processLine(leftover);
      }

      if (lastPercentPrinted < 100) {
        console.log(`Прогресс: 100% (${formatNumber(count)} строк обработано)`);
      }

      filteredStream.end();

      const endTime = process.hrtime.bigint();
      const elapsedSeconds = Number(endTime - startTime) / 1e9;

      const average = count > 0 ? sum / count : 0;

      const resultLines = [
        `Файл: ${inputFile}`,
        `Всего строк: ${formatNumber(count)}`,
        `Сумма чисел: ${formatNumber(sum)}`,
        `Среднее значение: ${average.toFixed(2)}`,
        `Максимальное число: ${max}`,
        `Минимальное число: ${min}`,
        `Строк с числом > 500: см. файл ${filteredFile}`,
        `Время выполнения: ${elapsedSeconds.toFixed(2)} сек`
      ];

      fs.writeFileSync(outputFile, resultLines.join('\n') + '\n', 'utf8');

      console.log('Обработка завершена!');
      console.log('Результаты:');
      console.log(`   - Всего строк: ${formatNumber(count)}`);
      console.log(`   - Сумма чисел: ${formatNumber(sum)}`);
      console.log(`   - Среднее значение: ${average.toFixed(2)}`);
      console.log(`   - Максимальное число: ${max}`);
      console.log(`   - Минимальное число: ${min}`);
      console.log(`Результаты сохранены в: ${outputFile}`);
      console.log(`Строки с числом > 500 сохранены в: ${filteredFile}`);
      console.log(`Время выполнения: ${elapsedSeconds.toFixed(2)} сек`);

      resolve();
    });

    readStream.on('error', reject);
    filteredStream.on('error', reject);
  });
}

(async () => {
  try {
    await generateFileIfNeeded();
    await processFile();
  } catch (err) {
    console.error('Произошла ошибка:', err.message);
    process.exit(1);
  }
})();
