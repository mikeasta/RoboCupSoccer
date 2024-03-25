// Устанавливаем ограничение на сокеты - 22 игрока в обеих командах
require('events').EventEmitter.defaultMaxListeners = 23;

// Инициализируем и запускаем игру
LAB_NUMBER = 6;

switch(LAB_NUMBER) {
    case 3: require("./lab_3/app").setupThirdLab(); break;
    case 4: require("./lab_4/app").setupFourthLab(); break;
    case 5: require("./lab_5/app").setupFifthLab(); break;
    case 6: require("./lab_6/app").setupSixthLab(); break;
}