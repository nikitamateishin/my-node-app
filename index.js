const http = require('http');
const server = http.createServer((req, res) => {
res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
});
const PORT = 3000;
server.listen(PORT, () => {
console.log(`Сервер запущен на http://localhost:${PORT}`);
});

const student = {
    fullName: "Матеишин Никита Анатольевич",
    group: "478",
    journalNumber: 12
};

function calculatePi(precision) {
    let pi = 0;
    let sign = 1;
    let denominator = 1;
    let iterations = 1;
    for (let i = 0; i < precision; i++) {
        iterations *= 10;
    }
    if (iterations > 1000000) {
        iterations = 1000000;
    }
    for (let i = 0; i < iterations; i++) {
        pi += sign / denominator;
        sign = -sign;
        denominator += 2;
    }
    pi *= 4;
    let piString = String(pi);
    let dotIndex = piString.indexOf('.');
    if (dotIndex !== -1) {
        piString = piString.substring(0, dotIndex + precision + 1);
    }
    return piString;
}
console.log(student.fullName);
console.log(student.group);
console.log(calculatePi(student.journalNumber));