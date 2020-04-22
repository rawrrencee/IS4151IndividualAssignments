let commandKey = ""
let commandValue = ""
let rebroadcastMsg = ""
/*
RELEASE: let state = 0
RELEASE: let district = 2
DEVELOPMENT: let state = 1 (pretend already handshaken)
DEVELOPMENT: let district = 2
*/
let state = 1
let district = 2
let randomWaitPeriod = 0
let handshakeStartTime = 0
let commandStartTime = 0
let numberOfHops = 1
let buffer: string[] = []
let msgHistory: string[] = []
let alreadyBroadcasted = false

//CONFIGURATION
radio.setGroup(district)
radio.setTransmitPower(1)
radio.setTransmitSerialNumber(true)
basic.showIcon(IconNames.Yes)

radio.onReceivedString(function (receivedString: string) {
    serial.writeLine("me: " + control.deviceName() + ", state = " + state + ", received string: " + receivedString)

    if (receivedString == "handshake") {
        basic.showString("H")

        for (let msg of msgHistory) {
            if (msg == "handshake") {
                alreadyBroadcasted = true
            }
        }
        if (!alreadyBroadcasted) {
            broadcast("handshake", true)
        }

        handshakeStartTime = input.runningTime()

        if (state == 0) {
            state = 1
            let enrolMyself = "enrol=" + control.deviceName()
            randomWait()
            broadcast(enrolMyself, true)
        }
    } else if (receivedString.includes("enrol=")) {
        if (state == 1 || state == 2) {
            alreadyBroadcasted = false

            for (let msg of msgHistory) {
                if (msg == receivedString) {
                    alreadyBroadcasted = true
                    break
                } else {
                    alreadyBroadcasted = false
                }
            }

            if (!alreadyBroadcasted) {
                broadcast(receivedString, true)
            }
        }
    } else if (receivedString.includes("sensor=")) {
        if (state == 1) {
            buffer = receivedString.split("=")
            commandKey = buffer[0]
            commandValue = buffer[1]

            if (commandKey == "sensor") {
                if (commandValue == "temp") {
                    state = 2
                    alreadyBroadcasted = false

                    for (let msg of msgHistory) {
                        if (msg == receivedString) {
                            alreadyBroadcasted = true
                            break
                        } else {
                            alreadyBroadcasted = false
                        }
                    }
                    if (!alreadyBroadcasted) {
                        broadcast(receivedString, true)
                    }

                    commandStartTime = input.runningTime()
                    randomWait()
                    broadcast("" + control.deviceName() + numberOfHops + input.temperature(), true)
                    serial.writeLine("broadcasted: " + control.deviceName() + numberOfHops + input.temperature())
                    basic.showString("T")
                }
            }
        }
    } else {
        if (state == 2) {
            alreadyBroadcasted = true
            for (let msg of msgHistory) {
                if (msg.substr(0, 5) == control.deviceName()) {
                    continue
                } else {
                    if (msg.substr(0, 5) == receivedString.substr(0, 5)) {
                        if (parseInt(msg.substr(5, 1)) < parseInt(receivedString.substr(5, 1)) + 1) {
                            return
                        }
                    }
                    alreadyBroadcasted = false
                }
            }
            if (!alreadyBroadcasted) {
                rebroadcastMsg = receivedString.substr(0, 5) + (parseInt(receivedString.substr(5, 1)) + 1) + receivedString.substr(6, 2)
                broadcast(rebroadcastMsg, false)
                return
            }
        }
    }
})

input.onButtonPressed(Button.AB, function () {
    basic.showString("DN:" + control.deviceName())
})

basic.forever(function () {

    if (commandStartTime != 0) {
        if (input.runningTime() - commandStartTime > 5 * 1000) {
            commandKey = ""
            commandValue = ""
            rebroadcastMsg = ""
            msgHistory = []
            buffer = []
            alreadyBroadcasted = false
            serial.writeLine("TEMP MEMORY CLEARED")
            state = 1
            commandStartTime = 0
        }
    }

})


function broadcast(receivedString: string, ownPacket: boolean) {
    if (ownPacket) {
        radio.setTransmitSerialNumber(false)
    } else {
        radio.setTransmitSerialNumber(true)
    }
    radio.sendString(receivedString)
    msgHistory.push(receivedString)
}

function randomWait() {
    randomWaitPeriod = Math.randomRange(100, 500)
    basic.pause(randomWaitPeriod)
}