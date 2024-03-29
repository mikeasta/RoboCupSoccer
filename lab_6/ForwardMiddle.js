const ForwardMiddle = {
    activity: "return",
    done(input) {
        input.cmd = {n: "turn", v: "0"}
        return
    },
    interceptActivity(input) {
        console.log("interceptActivity")
        let ball = input.ball
        console.log(ball)
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
            input.cmd = {n: "dash", v: "80", a: ball.angle.toString()}
    },
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
            return input.cmd
        }
    },
    returnActivity(input) {
        let flags = []
        let players = input.teamOwn
        let playersBusy = []
        let playerBusy = false
        let goalkeeperZoneEn = input.goalkeeperZoneEn
        let goalFlag = undefined
        let close = false
        let available = true
        if (!goalkeeperZoneEn.length) {
            input.cmd = {n: "turn", v: "60"}
            return;
        }
        for (let i = 0; i < goalkeeperZoneEn.length; i++) {
            let closestPlayers = input.closest(goalkeeperZoneEn[i])

            if (!closestPlayers.length) {
                flags.push(goalkeeperZoneEn[i])
                continue;
            }
            for (let j = 0; j < closestPlayers.length; j++) {
                if (closestPlayers[j].team != "own")
                    continue
                if (closestPlayers[j].distFl < goalkeeperZoneEn[i].dist) {
                    playersBusy.forEach(player => {
                        if (player.name == closestPlayers[j].name)
                            playerBusy = true
                    })
                    if (playerBusy) {
                        playerBusy = false
                        available = true
                        continue;
                    }
                    available = false
                    playersBusy.push(closestPlayers[j])
                    break;
                }
                else  {
                    flags.push(goalkeeperZoneEn[i])
                    break;
                }
            }
        if (available)
            flags.push(goalkeeperZoneEn[i])
        available = false
        }

        flags.sort((a,b) => a.dist - b.dist)
        goalFlag = flags[0]

        if (!goalFlag) {
            //input.cmd = {n: "turn", v: 60}
            return;
        }
        if (Math.abs(goalFlag.angle) > 15)
        {
            input.cmd = {n: "turn", v: goalFlag.angle.toString()}
            return
        }
        if (goalFlag.dist >= 0.8) {
            input.cmd = {n: "dash", v: "100"}
        }
    },

    waitActivity(input) {
        let ball = input.ball
        if (!ball) {
            //input.cmd = {n: "turn", v: "60"}
            return
        }
        if (Math.abs(ball.angle) > 15)
        {
            input.cmd = {n: "turn", v: ball.angle.toString()}
            return
        }
        return this.done(input);
    },

}
module.exports = ForwardMiddle;