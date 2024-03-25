const Taken = require('./taken')
const ForwardHigh = {
    prevActivity: "return",
    execute(input) {
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
        }
    },
    checkReturnCondition(input) {
        if (input.ball){
            let i = input.side == "l" ? 1 : -1
            if (i*input.getCoords(input.ball).x >= 0) {
                input.newActivity = 'intercept'
                this.prevActivity = 'return'
                return
            }
        }
        input.goalkeeperZoneEn.forEach(flag => {
            if (flag.dist <= 0.8) {
                input.newActivity = 'wait'
                this.prevActivity = 'return'
                return
            }
        })
    },
    instant(input) {
        //  if (input.playerClose)
        //      return {n:"turn", v:"60"}
        
        if (input.canKick) {
            let goal = input.goal
            console.log(goal)
            if (goal) {
                if (goal.dist > 30)
                    return {n: "kick", v: "40", a: goal.angle.toString()}
                input.newActivity = "return"
                return {n: "kick", v: "80", a: goal.angle.toString()}
            }
            else {
                return {n: "kick", v: "10", a: "45"}
            }
        }
    },

 
    checkWaitCondition(input) {
        if (!input.ball){
            input.newActivity = 'wait'
            this.prevActivity = 'wait'
            return
        }
        let i = input.side == "l" ? 1 : -1
        if (i*input.getCoords(input.ball).x >= 0) {
            input.newActivity = 'intercept'
            this.prevActivity = 'wait';
        }
    },

    checkInterceptCondition(input) {
        if (!input.ball) {
            input.newActivity = 'return'
            return
        }
        let players = input.closest(input.ball)
        let returnCond = false

        // console.log(players);
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
        let i = input.side == "l" ? -1 : 1
        if (i*input.getCoords(input.ball).x < i) {
            input.newActivity = 'return'
            this.prevActivity = "intercept"
        }
    },

}
module.exports = ForwardHigh;