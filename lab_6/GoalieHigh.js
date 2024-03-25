const Taken = require('./taken')
const coordsApi = require('./flags')
const GoalieHigh = {
    prevActivity: "return",
    catched: false,
    moved: false,
    execute(input) {
        // console.log("GoalieHigh")
        const immediate = this.instant(input)
        if (immediate) return immediate
        return this.getActivity(input)
    },
    getActivity(input){
        switch (input.currentActivity) {
            case "return": return this.checkReturnCondition(input);
                break;
            case "wait": return this.checkWaitCondition(input);
                break;
            case "intercept": return this.checkInterceptCondition(input);
                break;
            case "kick": return this.checkKickCondition(input);
                break;
        }
    },
    instant(input) {

            if (input.canKick) {
                this.moved = false
                let goal = input.goal
                let player = input.teamOwn.length ? input.teamOwn[0] : null
                let target
                if (goal && player)
                    target = goal.dist < player.dist ? goal : player
                else if (goal) target = goal
                else if (player) target = player
                if (target) {
                    // state.variables.turnKick = false
                    input.newActivity = "return"
                    return {n: "kick", v: "80", a: target.angle.toString()}
                } else {
                    return {n: "kick", v: "10", a: "45"}
                }
            }

    },

    checkReturnCondition(input) {
        //// console.log( input.ball)
        if (input.ball){
            let i = input.side == "l" ? 1 : -1
            // console.log(input.getCoords(input.ball) )
            if (input.ball.dist <= 15)
                input.newActivity = "intercept"

        }

        if (!input.goalOwn)
        {
            input.newActivity = 'return'
            return
        }
        if (input.goalOwn.dist <= 0.8) {
            input.newActivity = 'wait'

        } else {
            input.newActivity = 'return'
        }

    },
    checkKickCondition(input){
        if (!input.ball) {
            input.newActivity = 'return'
            return
        }
        if (input.ball > 2) {
            input.newActivity = 'return'
            return
        }
    },
    checkWaitCondition(input) {
        if (!input.ball){
            input.newActivity = 'wait'
            return
        }
        if (input.ball.dist <= 15)
            input.newActivity = "intercept"
    },
    checkInterceptCondition(input) {
        if (!input.ball) {
            input.newActivity = 'return'
            return
        }
        if (input.ball.dist > 15) {
            input.newActivity = 'return'
        }
    },

}
module.exports = GoalieHigh;