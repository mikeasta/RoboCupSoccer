const Taken = require('./taken')
const GoalieLow = {
    execute(input, controllers, team, side) {
        const next = controllers[0]
        this.taken = Taken.setSee(input, team, side)
        if (this.taken.ball && this.taken.ball.dist < 0.5)
            this.taken.canKick = true
        else
            this.taken.canKick = false

        if (this.taken.ball <= 0.8)
            this.taken.canCatch = true
        else
            this.taken.canCatch = false
        if (next)
            return next.execute(this.taken, controllers.slice(1))
    }
}
module.exports = GoalieLow;