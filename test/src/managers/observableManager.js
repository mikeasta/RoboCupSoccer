const convertFlagCoordsAccordingSide = require("../utils").convertFlagCoordsAccordingSide
const flagCoords = require("../data/flags.json")

class ObservableManager {
    constructor(agent) {
        this.agent = agent
    }

    // Определяем, видим ли вы объект
    getVisible(objectLabel) {
        const res = this.agent.observables.filter(element => element.label === objectLabel);
        return Boolean(res.length)
    }

    // Определяем расстояние до объекта
    getDistance(objectLabel) {
        const res = this.agent.observables.filter(element => element.label === objectLabel);
        if (!res.length) return false // Если не нашли объект
        
        return res[0].distance
    }

    // Определяем расстояние до объекта
    getAngle(objectLabel) {
        const res = this.agent.observables.filter(element => element.label === objectLabel);
        if (!res.length) return 45 // Если не нашли объект
        
        return res[0].direction
    }

    // Поиск сокомандников
    findTeammates() {
        const teammates = this.agent.observables.filter(observable => {
            if (observable.label[0] != "p") return false;
            if (observable.label.includes(this.agent.teamLabel)) return true;
        });
        return teammates;
    }

    // Вычислить угол ворот
    calcBallAngle(goalObjectLabel) {
        const observableObject = this.agent.observables.filter(element => element.label[0] === "f" || element.label[0] === "g")[0] 
        if (goalObjectLabel[0] === "f" || goalObjectLabel[0] === "g") {
            const goalObjectCoords = convertFlagCoordsAccordingSide(flagCoords[goalObjectLabel], this.agent.position)
            
            const x1 = observableObject.coords.x - this.agent.x, y1 = observableObject.coords.y - this.agent.y
            const x2 = goalObjectCoords.x        - this.agent.x, y2 = goalObjectCoords.y        - this.agent.y
            
            // Строим новый ортогональный базис
            const new_basis_vec_1 = { x: x1, y: y1 }, new_basis_vec_2 = { x: -y1, y: x1 } 

            // Переводим вектор (x2, y2) в новую систему координат
            const new_x2 = x2 * new_basis_vec_1.x + y2 * new_basis_vec_1.y
            const new_y2 = x2 * new_basis_vec_2.x + y2 * new_basis_vec_2.y

            // Находим синус и косинус
            const vector_length = Math.sqrt(new_x2**2 + new_y2**2)
            const vec_cos = new_x2 / vector_length
            const vec_sin = new_y2 / vector_length

            const angle = Math.round(-1 * Math.acos(vec_cos) * Math.pow(vec_sin, 0) * 180 / Math.PI - observableObject.direction)

            if (angle >= -90 && angle <= 90) return angle;
            else if (angle < -90) return -90
            else return 90
        }
        return 45
    }
}

module.exports = { ObservableManager }