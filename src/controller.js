const flagCoords = require("./data/flags.json")
const convertFlagCoordsAccordingSide = require("./utils").convertFlagCoordsAccordingSide
const distance = require("./utils").distance

class Controller {
    constructor() {
        this.max_flag_distance = 3
        this.max_ball_distance = 0.5
        this.min_turn_angle = 10
    }

    // Функция задержки исполнения синхронного кода
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

    // Выполнить цепочку действий
    async performActionQueue(agent, action_queue) {
        while (action_queue.length) {
            const current_action = action_queue[0]
            let res = false

            console.log("action ", current_action)
            switch(current_action["act"]) {
                case "flag": res = this.moveToFlag(agent, current_action["fl"]); break;
                case "kick": res = this.makeGoal(agent, current_action["goal"]); break;
            }

            // Выполнили действие
            if (res) action_queue.shift() 
            await this.sleep(100)
        }
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
            this.turnAgent(agent, 15)
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
        this.runAgent(agent, observable.distance > 10 ? 50 : 30)
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
            this.turnAgent(agent, 15)
            return false
        }

        // Проверяем дошли ли мы до мяча
        if (!this.moveAgentToObservable(agent, ball, this.max_ball_distance)) return false

        if (!flag) {
            this.kickBall(agent, 10, this.calcGoalAngle(agent, flagLabel))
            return false
        }

        // Удар по мячу в сторону ворот
        this.kickBall(agent, 1000, flag.direction)
        return false
    }

    calcGoalAngle(agent, goalObjectLabel) {
        const observableObject = agent.observables.filter(element => element.label[0] === "f" || element.label[0] === "g")[0]
        console.log(observableObject)
        if (goalObjectLabel[0] === "f" || goalObjectLabel[0] === "g") {
            const goalObjectCoords = convertFlagCoordsAccordingSide(flagCoords[goalObjectLabel], agent.position)
            
            const x1 = observableObject.coords.x , y1 = observableObject.coords.y 
            const x2 = goalObjectCoords.x ,        y2 = goalObjectCoords.y  
            const d1 = observableObject.distance, d2 = distance({x: agent.y, y: agent.y}, {x: x2, y: y2})
            console.log(x1, y1, x2, y2, d1, d2)
            return Math.acos((x1 * x2 + y1 * y2) / (d1 * d2))
        }
    }

    async turnAgent(agent, angle) {
        agent.act = {n: "turn", v: angle}
        agent.socketSend("turn", String(angle))
    }

    async runAgent(agent, power) {
        agent.act = {n: "dash", v: power}
        agent.socketSend("dash", String(power))
    }

    async kickBall(agent, power, angle) {
        agent.act = {n: "kick", v: power + ' ' + angle}
        agent.socketSend("kick", `${power} ${angle}`)
    }
}

module.exports = {Controller}