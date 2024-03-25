const Player_TA = {
    current: "start", // Текущее состояние автомата123
    state: { // Описание состояния
        variables: { dist: null }, // Переменные
        timers: { t: 0 }, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {}, // Внутренние переменные для методов
    },
    nodes: { /* Узлы автомата, в каждом узле: имя и узлы, на кото-
рые есть переходы */
        start: { n: "start", e: ["ballVisible","ballInVisible"]},
        ballVisible: {n: "ballVisible", e: ["far","close"]},
        close: { n: "close", e: ["kick"] },
        kick: { n: "kick", e: ["start"] },
        far: { n: "far", e: ["start"] },
        ballInVisible: { n: "ballInVisible", e: ["start"] }
    },
    edges: { /* Ребра автомата (имя каждого ребра указывает на
узел-источник и узел-приемник) */
        start_ballVisible: [{guard: [{s: "neq", l: {v: "dist"}, r: null}]}],
        start_ballInVisible: [{guard: [{s: "eq", l: {v:"dist"}, r: null}]}],
        ballInVisible_start: [{synch: "lookAround!"}],
        ballVisible_far: [{guard: [{s: "gt", l: {v:"dist"}, r: 0.7}]}],
        ballVisible_close: [{guard: [{s: "lte", l: {v:"dist"}, r: 0.7}]}],
        close_kick: [{synch: "kick!"}],
        kick_start: [{synch: "done!"}],
        far_start: [{synch: "runToBall!"}]
    },
    actions: {
        init(taken, state) { // Инициализация игрока

        },
        beforeAction(taken, state) {
// Действие перед каждым вычислением
            if(taken.ball) {
                state.variables.prevDist = state.variables.dist
                state.variables.dist = taken.ball.dist
                state.variables.prevAngle = state.variables.angle
                state.variables.angle = taken.ball.angle

            } else {
                state.variables.dist = null
                state.variables.angle = null
            }
        },
        kick(taken, state) { // Пинаем мяч
            state.next = true
            if(!taken.ball) return
            let dist = taken.ball.dist;
            if(taken.goal !== undefined) {
                return {n: "kick", v:80, a:taken.goal.angle}
            }
            return  {n: "kick", v: "10", a: 45}
        },
        goBack(taken, state) { // Возврат к воротам
            state.next = false
            let goalOwn = taken.goalOwn
            if(!goalOwn) return {n: "turn", v: 60}
            if(Math.abs(goalOwn.angle) > 10)
                return {n: "turn", v: goalOwn.angle}
            if(goalOwn.dist < 2) {
                state.next = true
                return {n: "turn", v: 180}
            }
            return {n: "dash", v: goalOwn.dist * 2 + 20}
        },
        lookAround(taken, state) { // Осматриваемся
            state.next = false
            state.synch = "lookAround!"
            if(!state.local.look)
                state.local.look = "left"
            let msg = undefined;
            switch (state.local.look) {
                case "left":
                    state.local.look = "center";
                    msg = {n: "turn", v: -60}
                case "center":
                    state.local.look = "right"; msg = {n: "turn", v: 60}
                case "right":
                    state.local.look = "back"; msg = {n: "turn", v: 60}
                case "back":
                    state.local.look = "left"
                    state.synch = undefined
                    msg = {n: "turn", v: 60}
                default: state.next = true
            }
            if (taken.ball)
                state.next = true;
            return msg
        },
        runToBall(taken, state) { // Бежим к мячу
            state.next = false
            let ball = taken.ball
            if(!ball) return this.lookAround(taken, state)
            if(ball.dist < 0.8) {
                state.next = true
                return
            }
            if(Math.abs(ball.angle) > 10)
                return {n: "turn", v: ball.angle}

            return {n: "dash", v: 100}
        },
        done(taken, state) { // Ничего делать не надо
            state.next = true; return {n: "turn", v: 0}
        },
        empty(taken, state) { state.next = true } // Пустое действие
    }
}
module.exports = Player_TA