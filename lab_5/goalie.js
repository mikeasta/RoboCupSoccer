const Goalie_TA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: { dist: null, turnKick: false, catch: 0, goalie: true }, // Переменные
        timers: { t: 0 }, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {}, // Внутренние переменные для методов
    },
    nodes: { /* Узлы автомата, в каждом узле: имя и узлы, на кото-
рые есть переходы */
        start: { n: "start", e: ["ballVisible","ballInVisible"]},
        ballVisible: {n: "ballVisible", e: ["far","near","close"]},
        close: { n: "close", e: ["catch"] },
        catch: { n: "catch", e: ["kick"]},

        kick: { n: "kick", e: ["kick","start"] },
        far: { n: "far", e: ["start"] },
        ballInVisible: { n: "ballInVisible", e: ["start"] },
        near: { n: "near", e: ["intercept", "start"] },
        intercept: { n: "intercept", e: ["start"] },
    },
    edges: { /* Ребра автомата (имя каждого ребра указывает на
узел-источник и узел-приемник) */
        start_ballInVisible:
            [{ guard: [{ s: "eq", l: {v: "dist"}, r: null }] }],
        /* Список guard описывает перечень условий, проверяемых
        * для перехода по ребру. Знак lt - меньше, lte - меньше
        * либо равно. В качестве параметров принимаются числа или
        * значения переменных "v" или таймеров "t" */
        start_ballVisible: [{ guard: [{ s: "neq", l: {v: "dist"}, r: null }]
                 }],
        ballInVisible_start: [{synch: "lookAround!"}],
        ballVisible_far: [{ guard: [{ s: "gte", l: {v: "dist"}, r: 10 }]
        }],
        ballVisible_near: [{ guard: [{ s: "gte", l: {v: "dist"}, r: 1.5 }, {s: "lt", l: {v: "dist"}, r: 10}]
        }],
        ballVisible_close: [{ guard: [{ s: "lt", l: {v: "dist"}, r: 1.5 }]
        }],
        close_catch: [{ synch: "catch!" }],
        /* Событие синхронизации synch вызывает на выполнение
        * соответствующую функцию */
        catch_kick: [{synch: "kick!"}],
        kick_kick: [{guard: [{s: "lt", l: {v: "dist"}, r: 3}, {s: "eq", l: {v: "turnKick"}, r: true }], synch: "kick!"}],
        kick_start: [{ synch: "goBack!", assign: [{ n: "t", v: 0,
                type: "timer" }] }],
        /* Список assign перечисляет присваивания для переменных
        * "variable" и таймеров "timer" */
        far_start: [{ synch: "lookAround!"}],
        near_start: [{
            synch: "empty!",
        }],
        near_intercept: [{ synch: "canIntercept?" }],
        /* Событие синхронизации synch может вызывать
        * соответствующую функцию для проверки возможности перехода
        * по ребру (заканчивается на знак "?") */
        intercept_start: [{ synch: "runToBall!"}]
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
        catch(taken, state) { // Ловим мяч
            if(!taken.ball) {
                state.next = true
                return
            }
            let angle = taken.ball.angle
            let dist = taken.ball.dist
            // console.log("angle " + angle)
            // console.log("catch " + state.variables.catch)
            state.next = false
            if(dist > 0.5) {
                if(state.variables.goalie) {
                    if(state.variables.catch < 3) {
                        state.variables.catch++
                        return {n: "catch", v: angle}
                    } else state.variables.catch = 0
                }
                if(Math.abs(angle) > 15) return {n: "turn", v: angle}
                return {n: "dash", v: 20}
            }
            state.next = true
        },
        kick(taken, state) { // Пинаем мяч
            state.next = true
            if(!taken.ball) {
                state.variables.turnKick = false
                return
            }
            let dist = taken.ball.dist
            //if(dist > 0.5) return;
            let angle = taken.ball.angle
            if (dist < 0.8) {
                let goal = taken.goal
                let player = taken.teamOwn ? taken.teamOwn[0] : null
                let target
                if (goal && player)
                    target = goal.dist < player.dist ? goal : player
                else if (goal) target = goal
                else if (player) target = player
                if (target) {
                    state.variables.turnKick = false
                    return {n: "kick", v: target.dist * 2 + 40, a: target.angle}
                }
                state.variables.turnKick = true
                return {n: "kick", v: "10", a: 45}
            } else {
                if (Math.abs(angle) > 10)
                    return {n: "turn", v: angle}
                return {n: "dash", v: 100}
            }
        },
        goBack(taken, state) { // Возврат к воротам
            state.next = false
            let goalOwn = taken.goalOwn
            if(!goalOwn) return {n: "turn", v: 60}
            if(Math.abs(goalOwn.angle) > 10)
                return {n: "turn", v: goalOwn.angle}
            if(goalOwn.dist < 3) {
                state.next = true
                return {n: "turn", v: 180}
            }
            return {n: "dash", v: goalOwn.dist * 2 + 40}
        },
        lookAround(taken, state) { // Осматриваемся
            state.next = false
            state.synch = "lookAround!"
            if(!taken.ball) return {n: "turn", v: 60}
            state.next = true
            state.synch = undefined
            if (Math.abs(taken.ball.angle )> 15) return {n: "turn", v: taken.ball.angle}
            return {n: "turn", v: taken.ball.angle}
        },

        canIntercept(taken, state) { // Можем добежать первыми
            let ball = taken.ball
            let ballPrev = taken.ballPrev
            state.next = true
            if(!ball) return false
            if(!ballPrev) return true
            if(ball.dist <= ballPrev.dist + 1) return true
            return false
        },
        runToBall(taken, state) { // Бежим к мячу
            state.next = false
            let ball = taken.ball
            if(!ball)
                return {n: "turn", v: 90}
            if(ball.dist <= 1.5) {
                state.next = true
                return {n: "turn", v: ball.angle}
            }
            if(Math.abs(ball.angle) > 10) return {n: "turn", v: ball.angle}
            return {n: "dash", v: 100}
        },
        done(taken, state) { // Ничего делать не надо
            state.next = true; return {n: "turn", v: 0}
        },
        empty(taken, state) { state.next = true } // Пустое действие
    }
}

module.exports = Goalie_TA