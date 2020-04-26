let commandKey = ""
let commandValue = ""
let rebroadcastMsg = ""
let state = 0
let personalWarningState = 0
let temperatureDiff = 0
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

radio.onReceivedString(function (receivedString: string) {
    serial.writeLine("me: " + control.deviceName() + ", state = " + state + ", received string: " + receivedString)

    if (receivedString.substr(0,5) == control.deviceName()) {
        if (receivedString.includes("=warning")) {
            personalWarningState = 1
        }
    }

    if (receivedString == "act=localLD") {
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
        
        for (let i = 0; i < 5; i++){
            led.plot(3, i)
        }
    }

    if (receivedString == "deact=localLD") {
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

        for (let i = 0; i < 5; i++){
            led.unplot(3, i)
        }
    }

    if (receivedString == "act=globalLD") {
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

        for (let i = 0; i < 5; i++){
            led.plot(4, i)
        }
    }

    if (receivedString == "deact=globalLD") {
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
        
        for (let i = 0; i < 5; i++){
            led.unplot(4, i)
        }
    }

    if (receivedString == "handshake") {

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
                let deviceName = receivedString.substr(0, 5)
                let numberOfHops = parseInt(receivedString.substr(5, 1))
                let temp = parseInt(receivedString.substr(6, 2))
                rebroadcastMsg = receivedString.substr(0, 5) + (numberOfHops + 1) + temp
                broadcast(rebroadcastMsg, false)

                if (numberOfHops == 1 && temp >= 36 && temp <= 38) {
                    let personalWarningMsg = deviceName + "=warning"
                    broadcast(personalWarningMsg, true)
                }
                return
            }
        }
    }
})

input.onButtonPressed(Button.AB, function () {
    basic.showString("DN:" + control.deviceName())
})

basic.forever(function () {

    displayLocalTemp()

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

    if (personalWarningState == 0) {
        if (input.temperature() < 36) {
            for (let i = 0; i < 5; i++) {
                led.unplot(2, i)
            }
        } else {
            personalWarningState = 1
        }
    }

    if (personalWarningState == 1) {
        if (input.temperature() >= 36) {
            for (let i = 0; i < 5; i++) {
                led.plot(2, i)
            }
        } else {
            personalWarningState = 0
        }
    }


})

function displayLocalTemp() {
    let previousTemperatureDiff = temperatureDiff
    temperatureDiff = input.temperature() - 30

    if (temperatureDiff <= 0) {
        temperatureDiff = 0
        for (let i = 0; i < 5; i++) {
            led.unplot(0, i)
            led.unplot(1, i)
        }
    } else if (temperatureDiff >= 10) {
        temperatureDiff = 10
        for (let i = 0; i < 5; i++) {
            led.plot(0, i)
            led.plot(1, i)
        }
    } else {
        if (temperatureDiff <= 5) {
            if (previousTemperatureDiff == 10) {
                for (let i = 0; i < 5; i++) {
                    led.unplot(0, i)
                    led.unplot(1, i)
                }
            }
            else if (previousTemperatureDiff <= 5) {
                led.unplot(0, previousTemperatureDiff - 1)
            } else {
                led.unplot(1, (previousTemperatureDiff % 5) - 1) 
            }
            led.plot(0, temperatureDiff - 1)
        } else {
            if (previousTemperatureDiff == 10) {
                for (let i = 0; i < 5; i++) {
                    led.unplot(0, i)
                    led.unplot(1, i)
                }
            }
            else if (previousTemperatureDiff > 5) {
                led.unplot(1, (previousTemperatureDiff % 5) - 1)
            } else {
                led.unplot(0, previousTemperatureDiff - 1) 
            }
            led.plot(1, (temperatureDiff % 5) - 1)
        }
    }
}

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