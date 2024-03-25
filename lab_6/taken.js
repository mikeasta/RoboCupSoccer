const coords = require("./flags");

const Taken = {
    state: {
        side: undefined,
        getCoords(flag) {
            return coords.findObjectCoordinates(flag, this.pos, this.flags)
        },
        
        inGoalkeeperZone(flag) {
            if (!flag) {
                if (this.pos.x <= coords.flagCoords(this.goalkeeperZone.t).x &&
                    this.pos.y <= coords.flagCoords(this.goalkeeperZone.t).y &&
                    this.pos.y >= coords.flagCoords(this.goalkeeperZone.b).y) {
                    return true
                }
                return false
            } else {

                if (this.getCoords(flag).x <= coords.flagCoords(this.goalkeeperZone.t).x &&
                    this.getCoords(flag).y <= coords.flagCoords(this.goalkeeperZone.t).y &&
                    this.getCoords(flag).y >= coords.flagCoords(this.goalkeeperZone.b).y) {
                    return true
                }
                return false
            }
        },

        searchFlag(flag) {

            for (let el of this.flags) {
                if (el.name.indexOf(flag.name)+1)
                    return el
            }
            if (flag.name == this.ball.name)
                return this.ball;
            return null
        },

        distanceBetween(flag1, flag2) {

            if (flag1 && flag2) {
                return coords.distanceBetween(flag1, flag2)
            }
            return undefined
        },

        closest(flag) {
            let flagData = this.searchFlag(flag)
            if (flagData){
                let players = this.teamOwn.concat(this.rivalTeam)
                if (!players.length)
                    return []
                for (let i = 0; i < players.length; i++) {
                    players[i].distFl = coords.distanceBetween(players[i], flagData)
                }
                players.sort((a,b) => (a.distFl - b.distFl))

                return players
            }
            return []
        },
        setHear(input) {
        },

    },

    setSee(input, team, side) {
        let gr, gl
        this.state.time = input[0]
        input.splice(0, 1);
        this.state.ballPrev = this.state.ball
        this.state.ball = undefined
        this.state.flags = []
        this.state.goalkeeperZone = []
        this.state.goalkeeperZoneEn = []
        this.state.defenderZone = []
        this.state.teamOwn = []
        this.state.rivalTeam = []
        this.state.pos = {}
        this.state.pos.x = undefined
        this.state.pos.y = undefined
        this.state.goalOwn = undefined
        this.state.goal = undefined
        this.state.topFlags = []
        this.state.bottomFlags = []
        this.state.objects = []
        for (let el of input) {
            let name = el.cmd.p.join("")
            if (el.cmd.p[0] === 'p' && (name.indexOf(team)+1)) {
                this.state.teamOwn.push({name: name, dist: el.p[0], angle: el.p[1], team: "own"})
            } else if (name === 'gr') {
                gr = {name: name, dist: el.p[0], angle: el.p[1]}
                this.state.flags.push({name: name, dist: el.p[0], angle: el.p[1]})
            } else if (name === 'gl') {
                gl = {name: name, dist: el.p[0], angle: el.p[1]}
                this.state.flags.push({name: name, dist: el.p[0], angle: el.p[1]})
            } else if (el.cmd.p[0] === 'p' && !(name.indexOf(team)+1)) {
                this.state.rivalTeam.push({name: name, dist: el.p[0], angle: el.p[1], team: "enemy"})
            } else if (el.cmd.p[0] == "b") {
                this.state.ball = {name: name, dist: el.p[0], angle: el.p[1]}
            } else if (el.cmd.p[0] == "f") {
                if (name === 'gr') {
                    gr = {name: name, dist: el.p[0], angle: el.p[1]}
                    this.state.flags.push({name: name, dist: el.p[0], angle: el.p[1]})
                } else if (name === 'gl') {
                    gl = {name: name, dist: el.p[0], angle: el.p[1]}
                    this.state.flags.push({name: name, dist: el.p[0], angle: el.p[1]})
                } else if (name.indexOf("t")+1) {
                    this.state.topFlags.push({name: name})
                    this.state.flags.push({name: name, dist: el.p[0], angle: el.p[1]})
                } else if (name.indexOf("b")+1) {
                    this.state.bottomFlags.push({name: name})
                    this.state.flags.push({name: name, dist: el.p[0], angle: el.p[1]})
                } else {
                    this.state.flags.push({name: name, dist: el.p[0], angle: el.p[1]})
                }
                if (side === 'l') {
                    if (name === "fplt") {
                        this.state.goalkeeperZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fplc") {
                        this.state.goalkeeperZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fplb") {
                        this.state.goalkeeperZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fprt") {
                        this.state.goalkeeperZoneEn.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fprc") {
                        this.state.goalkeeperZoneEn.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fprb") {
                        this.state.goalkeeperZoneEn.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fglt") {
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fglb") {
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name ==="fc") {
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    }
                } else {
                    if (name === "fplt") {
                        this.state.goalkeeperZoneEn.push({name: name, dist: el.p[0], angle: el.p[1]})

                    } else if (name === "fplc") {
                        this.state.goalkeeperZoneEn.push({name: name, dist: el.p[0], angle: el.p[1]})

                    } else if (name === "fplb") {
                        this.state.goalkeeperZoneEn.push({name: name, dist: el.p[0], angle: el.p[1]})

                    } else if (name === "fprt") {
                        this.state.goalkeeperZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fprc") {
                        this.state.goalkeeperZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fprb") {
                        this.state.goalkeeperZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name === "fgrt") {
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})

                    } else if (name === "fgrb") {
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    } else if (name ==="fc") {
                        this.state.defenderZone.push({name: name, dist: el.p[0], angle: el.p[1]})
                    }
                }
            }
        }


        this.state.goalOwn = side === 'l' ? gl : gr
        this.state.goal = side === 'l' ? gr : gl

        this.state.pos = coords.findCoordinates(this.state.flags)
        if (this.state.pos == undefined)
        {
            this.state.pos = {}
            this.state.pos.x = 0;
            this.state.pos.y = 0;
        }

        this.state.objects = this.state.flags.concat(this.state.teamOwn.concat(this.state.rivalTeam))
        this.state.objects.push(this.state.ball)
        this.state.side = side;
        return this.state
    }
};

module.exports = Taken;
