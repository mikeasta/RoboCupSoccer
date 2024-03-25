const FL = "flag", KI = "kick"
const primaryPlayerDecisionTree = {
    state: {
        next: 0,
        sequence: [{act: KI, fl: "b", goal: "gr"}],
        command: null
    },
    root: {
        exec(mgr, state) { state.action = state.sequence[state.next]; state.command = null },
        next: "goalVisible",
    },
    goalVisible: {
        condition: (mgr, state) => mgr.getVisible(state.action.fl),
        trueCond: "rootNext",
        falseCond: "rotate",
    },
    rotate:	{
        exec(mgr, state) { state.command = {n: "turn", v: "45"} },
        next: "sendCommand",
    },
    rootNext: {
        condition: (mgr, state) => state.action.act == FL,
        trueCond: "flagSeek",
        falseCond: "ballSeek",
    },
    flagSeek: {
        condition: (mgr, state) => 3 > mgr.getDistance(state.action.fl),
        trueCond: "closeFlag",
        falseCond: "farGoal",
    },
    closeFlag: {
        exec(mgr, state) {state.next++; state.action = state.sequence[state.next]},
        next: "rootNext",
    },
    farGoal: {
        condition: (mgr, state) => mgr.getAngle(state.action.fl) > 4,
        trueCond: "rotateToGoal",
        falseCond: "runToGoal",
    },
    rotateToGoal: {
        exec(mgr, state) { state.command = {n: "turn", v: mgr.getAngle(state.action.fl)} },
        next: "sendCommand",
    },
    runToGoal: {
        exec(mgr, state) { state.command = {n: "dash", v: 100} },
        next: "sendCommand",
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
    ballSeek: {
        condition: (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
        trueCond: "closeBall",
        falseCond: "farGoal",
    },
    closeBall: {
        condition: (mgr, state) => mgr.getVisible(state.action.goal),
        trueCond: "ballGoalVisible",
        falseCond: "ballGoallnvisible",
    },
    ballGoalVisible: {
        exec(mgr, state) { state.command = {n: "kick", v: `100 ${mgr.getAngle(state.action.goal)}`}},
        next: "sendCommand",
    },
    ballGoallnvisible: {
        exec(mgr, state) {state.command = {n: "kick", v: `20 ${mgr.calcBallAngle(state.sequence[0].goal)}`}},
        next: "sendCommand",
    }
}

module.exports = { primaryPlayerDecisionTree }