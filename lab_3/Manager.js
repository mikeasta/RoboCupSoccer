class Manager {
    constructor() {
        this.p = ''
        this.flgs = ''
        this.curAngle = 0
        this.curTurn = 0
        this.curDash = 0
        this.lead = false
        this.notLead = false
    }

    getAction(mgr, dt, p) {
        this.p = p
        function execute(dt, title){
            const action = dt[title]
            if(typeof action.exec == "function"){
                action.exec(mgr, dt.state)
                return execute(dt, action.next)
            }
            if(typeof action.condition == "function"){
                const cond = action.condition(mgr, dt.state)
                if(cond){
                    return execute(dt, action.trueCond)
                }
                return execute(dt, action.falseCond)
            }
            if(typeof action.command == "function"){
                return action.command(mgr, dt.state)
            }
            throw new Error(`Unexpected node in DT: ${title}`)
        }
        return execute(dt, "root")
    }

    getVisible(fl){
        if(fl == "p"){
            for(let i = 1; i < this.p.length; i++){
                if(this.p[i]['cmd']['p'].join('').startsWith(fl)){
                    return true;
                }
            }
        } else {
            for(let i = 1; i < this.p.length; i++){
                if(this.p[i]['cmd']['p'].join('') === fl){
                    return true;
                }
            }
        }

        return false
    }

    getDistance(fl) {
        if(fl == "p"){
            for(let i = 1; i < this.p.length; i++){
                if(this.p[i]['cmd']['p'].join('').startsWith(fl)){
                    return this.p[i]['p'][0]
                }
            }
        } else {
            for(let i = 1; i < this.p.length; i++){
                if(this.p[i]['cmd']['p'].join('') === fl){
                    return this.p[i]['p'][0]
                }
            }
        }
        return null
    }

    getAngle(fl) {
        if(fl == "p"){
            for(let i = 1; i < this.p.length; i++){
                if(this.p[i]['cmd']['p'].join('').startsWith(fl)){
                    return this.p[i]['p'][1]
                }
            }
        } else {
            for(let i = 1; i < this.p.length; i++){
                if(this.p[i]['cmd']['p'].join('') === fl){
                    return this.p[i]['p'][1]
                }
            }
        }
        return null

    }

    visibleObjectsCount(fl) {
        let counter = 0
        if(fl === "p") {
            for(let i = 1; i < this.p.length; i++){
                console.log(this.p[i])
                if(this.p[i]['cmd']['p'].join('').startsWith(fl)){
                    counter++
                }
            }
        } else {
            for(let i = 1; i < this.p.length; i++){
                console.log(this.p[i])
                if(this.p[i]['cmd']['p'].join('') === fl){
                    counter++
                }
            }
        }

        return counter
    }

    getPlayerDist(team, id = 0) {
        if (id === 0) {
            for (let i = 1; i< this.p.length; i++) {
                
                if (this.p[i].cmd.p[1] === team) {
                    return this.p[i].p[0];
                }
            }
            return null;
        } else {
            for (let i = 1; i< this.p.length; i++) {
                if (this.p[i].cmd.p[1] === team && this.p[i].cmd.p[2] === id) {
                    return this.p[i].p[0];
                }
            }
            return null;
        }
    }
    
    getPLayerAngle(team, id = 0) {
        if (id === 0) {
            for (let i = 1; i< this.p.length; i++) {
                if (this.p[i].cmd.p[1] === team) {
                    return this.p[i].p[1];
                }
            }
            return null;
        } else {
            for (let i = 1; i< this.p.length; i++) {
                if (this.p[i].cmd.p[1] === team && this.p[i].cmd.p[2] === id) {
                    return this.p[i].p[1];
                }
            }
            return null;
        }
    }

    countFlag(flag) {
        let count = 0;
        for(let i = 1; i< this.p.length; i++){
            if(this.p[i]['cmd']['p'].join('') === flag)
                count++;
        }
        return count;
    }

    getVisiblePlayer(team, id = 0) {
        if (id == 0) {
            for(let i = 1; i< this.p.length; i++){
                if (this.p[i].cmd.p[1] === team)
                    return this.p[i];
            }
        } else {
            for (let i = 1; i< this.p.length; i++) {
                console.log(this.p[i].cmd.p);
                if (this.p[i].cmd.p[1] === team && this.p[i].cmd.p[2] === id)
                   return this.p[i];
            }
        }
    }
}

module.exports = Manager;
