const Taken = require('./taken')
const ForwardLow = {
    execute(input, controllers, team, side) {
        const next = controllers[0]
        this.taken = Taken.setSee(input, team, side)
        if (this.taken.ball && this.taken.ball.dist <= 0.7)
            this.taken.canKick = true
        else
            this.taken.canKick = false
        let temp = false
        if (!this.taken.teamOwn.length) { this.taken.teamOwn.forEach(player => {
            if (player.dist < 1.2) {
                this.taken.playerClose = true
                temp = true
            }
        })}
        if (!temp)
            input.playerClose = false
        if (next)
            return next.execute(this.taken, controllers.slice(1))
    }
}
module.exports = ForwardLow;