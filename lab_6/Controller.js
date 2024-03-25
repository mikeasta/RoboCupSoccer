const FIRST_DISTANCE = 10
const FIRST_BALL_DISTANCE = 3
const SECOND_DISTANCE = 3
const SECOND_BALL_DISTANCE = 1
const HIGH_SPEED = 100
const LOW_SPEED = 50

class Controller {
    constructor(agent, targets) {
        this.agent = agent
        this.targets = targets
        this.targetIndex = 0
    }

    run(flgs, p, ball_idx){
        if(this.targetIndex < this.targets.length){
            if(this.targets[this.targetIndex]["act"] == "flag"){
                this.goToFlag(flgs, p)
            } else if(this.targets[this.targetIndex]["act"] == "kick"){
                this.dealWithBall(flgs,p, ball_idx)
            }
        }
    }

    findObj(flgs, p, obj){
        let objVisible = false
        let obj_idx = -1
        for(let i = 0; i < flgs.length; i++){
            //// console.log("to Find: ", obj, " found: ", p[flgs[i]]['cmd']['p'].join(''))
            if(p[flgs[i]]['cmd']['p'].join('') === obj){
                objVisible = true
                obj_idx = i
                break;
            }
        }
        return {visible: objVisible, idx: obj_idx}
    }

    goToObj(d,alpha, lowSpeed, highSpeed, firstDistance){
        if(alpha != 0){
            this.agent.socketSend('turn', (alpha).toString())
            return
        }
        if (d < firstDistance){
            this.agent.socketSend('dash', lowSpeed.toString())
        } else {
            this.agent.socketSend('dash', highSpeed.toString())
        }
    }

    goToFlag(flgs, p){
        let res = this.findObj(flgs,p,this.targets[this.targetIndex]['fl'])
        if(!res.visible){
            this.agent.socketSend('turn', 45)
            return;
        } else {
            let d1 = p[flgs[res.idx]]['p'][0]
            if(d1 >= SECOND_DISTANCE){
                let alpha1 = p[flgs[res.idx]]['p'][1]
                let speed = this.targets[targetIndex]['speed'] ? this.targets[targetIndex]['speed'] : HIGH_SPEED
                this.goToObj(d1,alpha1,LOW_SPEED,speed,FIRST_DISTANCE)
            } else {
                this.targetIndex++;
            }
        }
    }

    refresh(){
        this.targetIndex = 0
    }

    dealWithBall(flgs, p, ball_idx){
        //// console.log(ball_idx)
        if(ball_idx == -1){
            this.agent.socketSend('turn', 45)
            return;
        } else {
            //// console.log(p[ball_idx])
            let d1 = p[ball_idx]['p'][0]
            let alpha = p[ball_idx]['p'][1]
            if(d1 >= SECOND_BALL_DISTANCE){
                this.goToObj(d1,alpha,this.targets[this.targetIndex]["minspeed"],this.targets[this.targetIndex]["maxspeed"],FIRST_BALL_DISTANCE)
                return
            } else {
                let res_goal = this.findObj(flgs,p,this.targets[this.targetIndex]["goal"])
                if(!res_goal.visible){
                    // kick ball around one place
                    this.agent.socketSend('kick', '10 45')
                    return
                } else {
                        this.agent.socketSend('kick', this.targets[this.targetIndex]["power"] + ' ' + p[res_goal.idx]['p'][1].toString() )
                        this.targetIndex++
                        return
                }

            }
        }


    }

}

module.exports = Controller;