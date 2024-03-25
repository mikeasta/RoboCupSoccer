const Taken = {
    state: {
        teamOwn: [],
        rivalTeam: [],
        side: undefined,
    },
    setHear(input) {
    },
    setSee(input, team, side) {
        let gr, gl
        this.state.time = input[0]
        input.splice(0, 1);
        this.state.lookAroundFlags = {}
        this.state.ballPrev = this.state.ball
        this.state.ball = undefined
        this.state.lookAroundFlags.fprb = undefined
        this.state.lookAroundFlags.fprc = undefined
        this.state.lookAroundFlags.fprt = undefined
        this.state.goalOwn = undefined
        this.state.goal = undefined
        for (var el of input) {
            let name = el.cmd.p.join("")
            if (el.cmd.p[0] === 'p' && el.cmd.p.includes(team)) {
                this.state.teamOwn.push({f: name, dist: el.p[0], angle: el.p[1]})
            } else if (el.cmd.p[0] == "b" ) {
                this.state.ball = {f: name, dist: el.p[0], angle: el.p[1]}
            } else if (name === 'gr') {
                gr = {f: name, dist: el.p[0], angle: el.p[1]}
            } else if (name === 'gl') {
                gl = {f: name, dist: el.p[0], angle: el.p[1]}
            } else if (name === 'fprb') {
                this.state.lookAroundFlags.fprb = {f: name, dist: el.p[0], angle: el.p[1]}
            } else if (name === 'fprc') {
                this.state.lookAroundFlags.fprc = {f: name, dist: el.p[0], angle: el.p[1]}
            } else if (name === 'fprt') {
                this.state.lookAroundFlags.fprt = {f: name, dist: el.p[0], angle: el.p[1]}
            }

        }
        this.state.goalOwn = side === 'l' ? gl : gr
        this.state.goal = side === 'l' ? gr : gl
        this.side = side;
        return this.state
    },
};

module.exports = Taken;
