// Устанавливаем ограничение на сокеты - 22 игрока в обеих командах
require('events').EventEmitter.defaultMaxListeners = 23;

// Инициализируем и запускаем игру
const App = require("./src/app")
const app = new App()
app.setupGame()
app.startGame()

// Обрабатываем остановку программы
process.on('SIGINT', () => {
    // Завершаем работу игры - отключаем все сокеты
    app.closeGame()

    // Завершаем работу программы
    process.exit();
});