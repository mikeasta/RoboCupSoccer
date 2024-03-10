const flagCoords = require("./data/flags.json")
const convertFlagCoordsAccordingSide = require("./utils").convertFlagCoordsAccordingSide
const distance = require("./utils").distance

class AgentController {
    constructor() {
        this.max_flag_distance = 3
        this.max_ball_distance = 0.5
        this.min_turn_angle = 15
    }

    // Выполнить цепочку действий
    performAction(agent) {
        // Если нет действий в очереди действий
        if (!agent.actions.length) return
        
        const action = agent.actions[0]
        console.log(action)
        let res = false
        switch(action["act"]) {
            case "flag": res = this.moveToFlag(agent, action["fl"]); break;
            case "kick": res = this.makeGoal(agent, action["goal"]); break;
        }
        
        // Выполнили действие
        if (res) agent.actions.shift() 
    }

    // Перемещение к флагу
    moveToFlag(agent, flagLabel) {
        let flag
        for (let observable of agent.observables) {
            if (observable.label === flagLabel) {
                flag = observable
                break
            }
        }
        
        if (flag) { // Если флаг видно, двигаемся по направлению к нему
            return this.moveAgentToObservable(agent, flag, this.max_flag_distance)
        } else { // Если флаг не видно, поворачиваемся, пока не увидим флаг
            this.turnAgent(agent, 10)
            return false
        }
    }

    // Перемещение к наблюдаемому объекту
    moveAgentToObservable(agent, observable, max_observable_distance) {
        if (observable.distance < max_observable_distance) return true

        if (Math.abs(observable.direction) > this.min_turn_angle) { 
            this.turnAgent(agent, observable.direction)
            return false
        }

        // run slower if its not too far
        // check if it is acceleration or absolute speed
        this.runAgent(agent, observable.distance > 10 ? 100 : 20)
        return false
    }

    // Забивание мяча
    makeGoal(agent, flagLabel) {
        let flag = null, ball = null
        for (let observable of agent.observables) {
            // Находим флаг
            if (observable.label === flagLabel && observable.distance < 50) flag = observable
            
            // Находим мяч
            if (observable.label[0] === 'b') ball = observable

            // Останавливаемся, когда обнаружили мяч и флаг
            if (ball && flag) break
        }

        // Проверяем есть ли мяч в поле зрения
        if (!ball) {
            this.turnAgent(agent, 10)
            return false
        }

        // Проверяем дошли ли мы до мяча
        if (!this.moveAgentToObservable(agent, ball, this.max_ball_distance)) 
            return false

        if (!flag) {
            this.kickBall(agent, 10, this.calcGoalAngle(agent, flagLabel))
            return false
        }

        // Удар по мячу в сторону ворот
        this.kickBall(agent, 1000, flag.direction)
        return false
    }

    // Посчитать угол удара мяча в случае, когда не видна точка для достижения цели.
    calcGoalAngle(agent, goalObjectLabel) {
        const observableObject = agent.observables.filter(element => element.label[0] === "f" || element.label[0] === "g")[0] 
        if (goalObjectLabel[0] === "f" || goalObjectLabel[0] === "g") {
            const goalObjectCoords = convertFlagCoordsAccordingSide(flagCoords[goalObjectLabel], agent.position)
            
            const x1 = observableObject.coords.x - agent.x, y1 = observableObject.coords.y - agent.y
            const x2 = goalObjectCoords.x        - agent.x, y2 = goalObjectCoords.y        - agent.y
            
            // Строим новый ортогональный базис
            const new_basis_vec_1 = { x: x1, y: y1 }, new_basis_vec_2 = { x: -y1, y: x1 } 

            // Переводим вектор (x2, y2) в новую систему координат
            const new_x2 = x2 * new_basis_vec_1.x + y2 * new_basis_vec_1.y
            const new_y2 = x2 * new_basis_vec_2.x + y2 * new_basis_vec_2.y

            // Находим синус и косинус
            const vector_length = Math.sqrt(new_x2**2 + new_y2**2)
            const vec_cos = new_x2 / vector_length
            const vec_sin = new_y2 / vector_length

            const angle = Math.acos(vec_cos) * Math.pow(vec_sin, 0) * 180 / Math.PI - observableObject.direction
            return Math.round(-angle)
        }
        return 45
    }

    // Функции для записи действия
    turnAgent(agent, angle) {
        agent.act = {n: "turn", v: angle}
    }

    runAgent(agent, power) {
        agent.act = {n: "dash", v: power}
    }

    kickBall(agent, power, angle) {
        agent.act = {n: "kick", v: power + ' ' + angle}
    }
}

module.exports = {AgentController}