// Устанавливаем ограничение на сокеты - 22 игрока в обеих командах
require('events').EventEmitter.defaultMaxListeners = 23;

// Инициализируем и запускаем игру
const App = require("./src/app")
const app = new App()
app.setupSecondLab()