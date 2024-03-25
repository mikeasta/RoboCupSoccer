const FL = "flag", KI = "kick"
const secondaryRightPlayerDecisionTree = {
    state: {
        next: 0,
        sequence: [{act: FL, fl: "frb"}, {act: FL, fl: "gl"}, {act: KI, fl: "b", goal: "gr"}],
        command: null,
        visiblePlayer: null
    },
    root: {
        exec(mgr, state) { state.action =
            state.sequence[state.next]; state.command = null },
        next: "seekPlayer",
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
    rotate: {
        exec (mgr, state) { state.command = {n: "turn", v: "45"} },
        next: "sendCommand",
    },
    seekPlayer: {
        exec(mgr,state) {state.visiblePlayer = mgr.findTeammates()[0]},
        next: "playerClose",
    },
    playerClose: {
        condition: (mgr,state) => state.visiblePlayer.distance < 1 && Math.abs(state.visiblePlayer.direction) < 40,
        trueCond: "turnMin30",
        falseCond: "playerFar",
    },
    playerFar: {
        condition: (mgr, state) => state.visiblePlayer.distance > 10,
        trueCond: "farAngleCheck",
        falseCond: "closeAngleCheck",
    },
    farAngleCheck: {
        condition: (mgr, state) => Math.abs(state.visiblePlayer.direction) > 50,
        trueCond: "turnPlayer",
        falseCond: "dash100",
    },
    closeAngleCheck: {
        condition: (mgr,state) => state.visiblePlayer.direction < -40 || state.visiblePlayer.direction > -25,
        trueCond: "turn30",
        falseCond: "distCheck",
    },
    distCheck: {
        condition: (mgr, state) => state.visiblePlayer.distance < 7,
        trueCond: "dash40",
        falseCond: "dash80"
    },
    turnPlayer: {
        exec(msg, state) {state.command = {n: "turn", v: state.visiblePlayer.direction}},
        next: "sendCommand",
    },
    dash80: {
        exec(msg, state) {state.command = {n: "dash", v: 80}},
        next: "sendCommand"
    },
    dash100: {
        exec(msg, state) {state.command = {n: "dash", v: 100}},
        next: "sendCommand"
    },
    dash40: {
        exec(msg, state) {state.command = {n: "dash", v: 40}},
        next: "sendCommand"
    },
    turnMin30: {
        exec(msg, state) {state.command = {n: "turn", v: -30}},
        next: "sendCommand",
    },
    turn30: {
        exec(msg, state) {state.command = {n: "turn", v: 30}},
        next: "sendCommand",
    },
}

module.exports = { secondaryRightPlayerDecisionTree }