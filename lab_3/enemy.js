const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера

const args = process.argv;

let teamName = 'Polars' // Имя команды

var createAgent = function createAgent(teamName, pos1, pos2, turn){
    let agent1 = new Agent(teamName) // Создание экземпляра агента
    require('./socket')(agent1, teamName, VERSION) // Настройка сокета
    setTimeout(function() {
        agent1.socketSend('move', pos1 + ' ' + pos2) // Размещение игрока на поле
        agent1.turn_moment = turn
        agent1.init_x = pos1
        agent1.init_y = pos2
      }, 20);
}

createAgent(teamName, '-35','8',1)
createAgent(teamName, '-35', '-8', 1)

