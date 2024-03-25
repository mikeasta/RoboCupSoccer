const Agent = require('./agent'); 
const { AgentController } = require('./controller');
const createAgentSocket = require('./socket')
const VERSION_DEFAULT = 7
const prompt = require("prompt-sync")();
const agentsArrangement = require("./data/agents.json")

class App {
    constructor(version=VERSION_DEFAULT, leftTeamLabel="Pandas", rightTeamLabel="Polars") {
        this.version = version

        this.leftTeamLabel  = leftTeamLabel
        this.rightTeamLabel = rightTeamLabel

        this.teams = {}
        this.teams[leftTeamLabel]  = []
        this.teams[rightTeamLabel] = []
    }

    // Функция задержки исполнения синхронного кода
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

    // Добавить агента 
    addAgent(teamLabel, debug=false) {
        // Проверяем, определена ли команда
        if (!Object.hasOwn(this.teams, teamLabel)) throw Error(`Команды '${teamLabel}' не существует`)
        
        // Создаем агента
        const agent = new Agent(debug)

        // Создаем сокет
        createAgentSocket(agent, teamLabel, this.version)

        // Добавить агента в команду
        this.teams[teamLabel].push(agent)
        return agent
    }

    // Запуск ЛР №3
    async setupThirdLab() {
        // Setup Pandas Team
        for (let i = 0; i < 11; i++) {
            const agentInfo = agentsArrangement[i]
            const agent = this.addAgent(this.leftTeamLabel);                  await this.sleep(5);
            agent.socketSend("move", `${agentInfo["x"]} ${agentInfo["y"]}`);  await this.sleep(5);
            
            // Задаем параметры игрока
            agent.setRole(agentInfo["role"])
            agent.setNumber(i+1),
            agent.setTeamLabel(this.leftTeamLabel)
            if (i+1 > 8) agent.enableDecisionManager() // 9, 10, 11 players
        }

        // Setup Polars Team
        const agentInfo = agentsArrangement[0]
        const enemyAgent = this.addAgent(this.rightTeamLabel);                 await this.sleep(5);
        enemyAgent.socketSend("move", `${agentInfo["x"]} ${agentInfo["y"]}`);  await this.sleep(5);
        
        // Задаем параметры игрока
        enemyAgent.setRole(agentInfo["role"])
        enemyAgent.setNumber(1),
        enemyAgent.setTeamLabel(this.rightTeamLabel)
        enemyAgent.enableDecisionManager()
    }
}

module.exports = App;