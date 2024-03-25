const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера

// Имена команд
let leftTeamName  = 'Pandas' 
let rightTeamName = 'Polars'

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

const setupSixthLab = () => {
	// Left Team
  	createAgent(leftTeamName, '-20','-5', 1, "forward")
	createAgent(leftTeamName, '-20','5', 1, "forward")
	createAgent(leftTeamName, '-10','0', 1, "forward")

	createAgent(leftTeamName, '-25','15', 1, "defender")
	createAgent(leftTeamName, '-25','-15', 1, "defender")
	createAgent(leftTeamName, '-25','0', 1, "defender")

	createAgent(leftTeamName, '-35','-20', 1, "defender")
	createAgent(leftTeamName, '-35','20', 1, "defender")

	createAgent(leftTeamName, '-40','-10', 1, "defender")
	createAgent(leftTeamName, '-40','10', 1, "defender")

	createAgent(leftTeamName, '-50','0', 1, "goalie")

	// Right Team
	createAgent(rightTeamName, '-20','-5', 1, "forward")
	createAgent(rightTeamName, '-20','5', 1, "forward")
	createAgent(rightTeamName, '-10','0', 1, "forward")

	createAgent(rightTeamName, '-25','15', 1, "defender")
	createAgent(rightTeamName, '-25','-15', 1, "defender")
	createAgent(rightTeamName, '-25','0', 1, "defender")

	createAgent(rightTeamName, '-35','-20', 1, "defender")
	createAgent(rightTeamName, '-35','20', 1, "defender")

	createAgent(rightTeamName, '-40','-10', 1, "defender")
	createAgent(rightTeamName, '-40','10', 1, "defender")

	createAgent(rightTeamName, '-50','0', 1, "goalie")
}


module.exports = { setupSixthLab }
