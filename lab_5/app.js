const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера
const args = process.argv;
console.log(args)
let teamName = 'Pandas' // Имя команды

var createAgent = function createAgent(teamName, pos1, pos2, turn, pose){
    let agent1 = new Agent(teamName, pos1, pos2, pose) 
    require('./socket')(agent1, teamName, VERSION)
    setTimeout(function() {
        agent1.socketSend('move', pos1 + ' ' + pos2) 
        agent1.turn_moment = turn
        agent1.init_x = pos1
        agent1.init_y = pos2
      }, 20);
}

const setupFifthLab = () => {
    createAgent(teamName, '-10','0', 1, "left")
    createAgent("Polars", '-50','0', 1, "goalie")
}


module.exports = { setupFifthLab }
