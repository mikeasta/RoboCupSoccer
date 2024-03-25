const Taken = require('./taken')
const DefenderHigh = {
    prevActivity: "return",
    execute(input) {
        const immediate = this.instant(input)
        if (immediate) return immediate
        this.getActivity(input)
        return
    },
    getActivity(input){
        switch (input.currentActivity) {
            case "return": return this.checkReturnCondition(input);
                break;
            case "wait": return this.checkWaitCondition(input);
                break;
            case "intercept": return this.checkInterceptCondition(input);
                break;
        }
    },
    instant(input) {
        if (input.canKick) {
            let goal = input.goal
            let player = input.teamOwn.length ? input.teamOwn[0] : null
            let target = ''
            if (goal && player)
                target = goal.dist < player.dist ? goal : player
            else if (goal) target = goal
            if (target) {
                input.newActivity = "return"
                return {n: "kick", v: "80", a: target.angle.toString()}
            } else {
                return {n: "kick", v: "10", a: "45"}
            }
        }
    },
    checkWaitCondition(input) {
        if (!input.ball){
            input.newActivity = 'wait'
            return
        }
        let i = input.side == "l" ? 1 : -1
        if (i*input.getCoords(input.ball).x < 0) {
            input.newActivity = 'intercept'
            this.prevActivity = 'wait';
        }
    },

    checkReturnCondition(input) {
        if (input.ball){
            let i = input.side == "l" ? 1 : -1
            if (i*input.getCoords(input.ball).x < 0) {
                input.newActivity = 'intercept'
                this.prevActivity = 'return';
                return
            }
        }

        input.defenderZone.forEach(flag => {
            if (flag.dist <= 3) {
                input.newActivity = 'wait'
                return
            }
        })
    },

    checkInterceptCondition(input) {
        if (!input.ball) {
            input.newActivity = 'return'
            return
        }
        let players = input.closest(input.ball)
        let returnCond = false
        players.forEach(player => {
            if (player.team != "own")
                return
            if (player.distFl < input.ball.dist) {
                input.newActivity = 'return'
                returnCond = true
            }

        })
        if (returnCond)
            return
        let i = input.side == "l" ? 1 : -1
        if (i*input.getCoords(input.ball).x > 0) {
            input.newActivity = 'return'
            this.prevActivity = 'intercept'
            return
        }
    },

}
module.exports = DefenderHigh;