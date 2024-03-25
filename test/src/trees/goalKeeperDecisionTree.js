const FL = "flag", KI = "kick"
const goalKeeperDecisionTree = {
    state: {
      next: 0,
        sequence: [{act: "Goal", fl: "gr"}, {act: "Center", fl: "fprc"},
            {act: "Side", fl: "fprt"}, {act: "Side", fl: "fprb"}, {act: "Ball", fl: "b"}],
        command: null
    },
    root: {
        exec(mgr, state) { 
          //console.log("State.next: ", state.next)
          state.action =
            state.sequence[state.next]; state.command = null },
        next: "ballVisible",
    },
    ballVisible: {
        condition(mgr, state){
          //console.log("ballVisible")
          return (mgr.getVisible("b") && mgr.getDistance("b") < 5)
        },
        trueCond: "ballClose",
        falseCond: "goalSequence",
    },
    goalSequence: {
        condition(mgr, state){
          //console.log("goalSequence")
          return state.action.act == "Goal"
      },
        trueCond: "seekGoal",
        falseCond: "centerSequence"
    },
    seekGoal: {
        condition(mgr, state){
          //console.log("seekGoal")
          return mgr.getVisible(state.action.fl)
        },
        trueCond: "goalDist",
        falseCond: "rotate"
    },
    rotate: {
        exec (mgr, state) { 
          //console.log("rotate")
          state.command = {n: "turn", v: "45"} 
      },
        next: "sendCommand",
    },
    goalDist: {
        condition(mgr, state){
          //console.log("goalDist")
          return mgr.getDistance(state.action.fl) > 5
      },
        trueCond: "runToGoal",
        falseCond: "nextSeq"
    },
    runToGoal: {
        exec(mgr,state) {
          console.log("runToGoal")
          state.command = {n: "dash", v: `100 ${mgr.getAngle(state.action.fl)}`}
      },
        next: "sendCommand"
    },
    goToGoal: {
        exec(mgr, state) {
          //console.log("goToGoal")
          state.command = {n: "dash", v: `30 ${mgr.getAngle(state.action.fl)}`}
      },
        next: "sendCommand"
    },
    sendCommand: {
        command(mgr, state){
          //console.log("sendCommand")
          return state.command
      }
    },
    nextSeq: {
        exec(mgr, state) {
          //console.log("nextSeq")
          state.next++; 
          state.action = state.sequence[state.next]; 
          //console.log(state.next+ "!!!!!!!") 
        },
        next: "wait",
    },
    centerSequence: {
        condition(mgr, state){
          //console.log("centerSequence")
          return state.action.act == "Center"
      },
        trueCond: "seekFlag",
        falseCond: "sideSequence"
    },
    seekFlag: {
        condition(mgr,state){
          //console.log("seekFlag")
          return mgr.getVisible(state.action.fl)
      },
        trueCond: "centerDist",
        falseCond: "rotate"
    },
    centerDist: {
        condition(mgr,state){
          //console.log("centerDist")
          //console.log(`${ mgr.getDistance(state.action.fl)}+++++++${state.action.fl}`) ;
          return mgr.getDistance(state.action.fl) > 12 && mgr.getDistance(state.action.fl) < 16
        },
        trueCond: "nextSeq",
        falseCond: "centerDistCheck",
    },
    centerDistCheck: {
        condition(mgr, state){
          //console.log("centerDistCheck")
          return mgr.getDistance(state.action.fl) <= 20
      },
        trueCond: "goBack",
        falseCond: "goToGoal"
    },
    goBack: {
        exec(mgr, state) {
          //console.log("goBack")
          state.command = {n: "dash", v: `-20 ${mgr.getAngle(state.action.fl)}`}},
        next: "sendCommand"
    },
    sideSequence: {
        condition(mgr,state){
          //console.log("sideSequence")
          return state.action.act == "Side"},
        trueCond: "seekSide",
        falseCond: "ballSequence"
    },
    seekSide: {
        condition(mgr, state){
          //console.log("seekSide")
          return mgr.getVisible(state.action.fl)
      },
        trueCond: "sideDist",
        falseCond: "rotate"
    },
    sideDist: {
        condition(mgr,state){
          //console.log("sideDist")
          //console.log(`${ mgr.getDistance(state.action.fl)}+++++++${state.action.fl}`) ;
          return mgr.getDistance(state.action.fl) > 20 && mgr.getDistance(state.action.fl) < 28
        },
        trueCond: "nextSeq",
        falseCond: "sideDistCheck",
    },
    sideDistCheck: {
        condition(mgr,state){
          //console.log("sideDistCheck")
          return mgr.getDistance(state.action.fl) <= 20},
        trueCond: "goBack",
        falseCond: "goToGoal"
    },
    ballSequence: {
        condition(mgr,state){
          //console.log("ballSequence")
          return mgr.getVisible("b")},
        trueCond: "ballDist",
        falseCond: "rotate",
    },
    ballDist: {
        condition(mgr,state){ 
          //console.log("ballDist"); 
          return mgr.getDistance(state.action.fl) < 15},
        trueCond: "ballClose",
        falseCond: "wait"
    },
    wait: {
        exec(mgr,state) {
          //console.log("wait");
          state.command = {n:"dash", v: 0}},
        next: "sendCommand"
    },
    ballClose: {
        condition(mgr, state){
          //console.log("ballClose"); 
          return mgr.getDistance("b") < 2},
        trueCond: "closeDist",
        falseCond: "goToBall"
    },
    closeDist: {
        condition(mgr, state){
          //console.log("closeDist"); 
          return mgr.getDistance("b") < 2},
        trueCond: "goalDir",
        falseCond: "catchBall"
    },
    catchBall: {
      exec(mgr,state){
        //console.log("catchBall");
        state.command = {n: "catch", v: mgr.getAngle("b")}},
      next: "sendCommand"
    },
    goToBall: {
        exec(mgr,state) {
          //console.log("goToBall"); 
          state.command = {n: "dash", v: `100 ${mgr.getAngle("b")}`}},
        next: "sendCommand"
    },

    goalDir: {
        condition(mgr,state){
          //console.log("goalDir"); 
          return mgr.getVisible("gr") == false},
        trueCond: "kickBall",
        falseCond: "rotateBall",
    },

    kickBall: {
        exec(mgr, state) {
          //console.log("kickBall"); 
          state.command = {n: "kick", v: `100 ${mgr.getAngle("gl")}`}},
        next: "sendCommand",
    },

    rotateBall: {
        exec (mgr, state) {
          //console.log("rotateBall"); 
          state.command = {n: "kick", v: "10 45"}; state.next = state.sequence.length-1},
        next: "sendCommand",
    }
}

module.exports = { goalKeeperDecisionTree }