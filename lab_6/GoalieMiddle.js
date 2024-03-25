const Taken = require('./taken')
const GoalieMiddle = {
    interceptActivity(input) {
        let ball = input.ball
        if (!ball) {
            input.cmd = {n: "turn", v: 60}
            return
        }
        if (Math.abs(ball.angle) > 15)
        {
            input.cmd = {n: "turn", v: ball.angle.toString()}
            return
        }
        if (ball.dist >= 0.8)
            input.cmd = {n: "dash", v:"80"}
    },
    activity: "return",
    execute(input, controllers) {
        const next = controllers[0]
        switch (this.activity) {
            case "return": this.returnActivity(input);
                break;
            case "wait": this.waitActivity(input);
                break;
            case "intercept": this.interceptActivity(input);
                break;
        }
        input.currentActivity = this.activity;
        if (next) {
            const command = next.execute(input, controllers.slice(1))
            if (command) return command
            if (input.newActivity) this.activity = input.newActivity
            // console.log(input.newActivity)
            return input.cmd
        }
    },

    waitActivity(input) {
        let ball = input.ball
        if (!ball) {
            //input.cmd = {n: "turn", v: 60}
            return
        }
        if (Math.abs(ball.angle) > 15)
        {
            input.cmd = {n: "turn", v: ball.angle.toString()}
            return
        }
        return this.done(input);
    },

    returnActivity(input) {
        let flag = input.goalOwn
        if (!flag) {
            //input.cmd = {n: "turn", v: 60}
            return;
        }
        if (Math.abs(flag.angle) > 15)
        {
            input.cmd = {n: "turn", v: flag.angle.toString()}
            return
        }
        if (flag.dist >= 0.8) {
            input.cmd = {n: "dash", v: "100"}
        }
    },
    done(input) {
        input.cmd = {n: "turn", v: "0"}
        return
    },

}
module.exports = GoalieMiddle;