const ObservableManager = require("./observableManager").ObservableManager
const primaryPlayerDecisionTree = require("../trees/primaryPlayerDecisionTree").primaryPlayerDecisionTree
const secondaryLeftPlayerDecisionTree = require("../trees/secondaryLeftPlayerDecisionTree").secondaryLeftPlayerDecisionTree
const secondaryRightPlayerDecisionTree = require("../trees/secondaryRightPlayerDecisionTree").secondaryRightPlayerDecisionTree
const goalKeeperDecisionTree = require("../trees/goalKeeperDecisionTree").goalKeeperDecisionTree


class DecisionManager {
    constructor(agent) {
        this.agent = agent
        this.observableManager = new ObservableManager(this.agent);
    }

    getRole() {
        if (this.agent.role == "goalkeeper") {
            this.role = "goalkeeper";
            return
        }

        const teammates = this.observableManager.findTeammates()
        if (!Boolean(teammates.length)) {
            this.role = "primary";
            return;
        }

        const teammate = teammates[0]
        
        this.role = teammate.direction >= 0 ? "secondary_l": "secondary_r";
    }

    getAction() {
        // I. Определяем роль игрока
        this.getRole()

        // II. Согласно роли определяем дерево решений
        let dt
        switch (this.role) {
            case "primary":     dt = primaryPlayerDecisionTree;         break;
            case "secondary_l": dt = secondaryLeftPlayerDecisionTree;   break;
            case "secondary_r": dt = secondaryRightPlayerDecisionTree;  break;
            case "goalkeeper":  dt = goalKeeperDecisionTree;            break;
        }
    
        // III. Исполняем инструкции, указанные в дереве
        const execute = (dt, title) => {
            const action = dt[title]
            if (typeof action.exec == "function") {
                action.exec(this.observableManager, dt.state)
                return execute(dt, action.next)
            }
    
            if (typeof action.condition == "function") {
                const cond = action.condition(this.observableManager, dt.state)
                if (cond) return execute(dt, action.trueCond)
                return execute(dt, action.falseCond)
            }
    
            if (typeof action.command == "function") 
                return action.command(this.observableManager, dt.state)
        
            throw new Error('Unexpected node in DT: ${title}')
        }
    
        return execute(dt, "root")
    }
}

module.exports = { DecisionManager }