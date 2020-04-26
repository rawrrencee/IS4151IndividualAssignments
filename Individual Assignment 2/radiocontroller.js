
let state = 0
let microbitDevices: string[] = []
let sensorValues: string[] = []
let handshakeStartTime = 0
let commandStartTime = 0
let data = ""
let response = ""
let buffer: string[] = []
let msgHistory: string[] = []
let DISTRICT_ORIGIN = 1
let district = DISTRICT_ORIGIN
let globalLD = false

//CONFIGURATION
radio.setGroup(DISTRICT_ORIGIN)
radio.setTransmitPower(1)
radio.setTransmitSerialNumber(true)
basic.showIcon(IconNames.Yes)

basic.forever(function () {
    basic.showNumber(state)

    if (state == 1) {
        if (input.runningTime() - handshakeStartTime > 5 * 1000) {
            state = 2
            response = ""
            for (let microbitDevice of microbitDevices) {
                if (response.length > 0) {
                    response = "" + response + "," + microbitDevice
                } else {
                    response = microbitDevice
                }
            }
            serial.writeLine("enrol=" + response)
        }
    } else if (state == 3) {
        if (input.runningTime() - commandStartTime > 5 * 1000) {
            response = ""
            for (let sensorValue of sensorValues) {
                if (response.length > 0) {
                    response = "" + response + "," + sensorValue
                } else {
                    response = sensorValue
                }
            }
            serial.writeLine("" + response)
            state = 2
        }
    } else if (state == 4) {
        if (input.runningTime() - commandStartTime > 10 * 1000) {
            response = ""
            for (let sensorValue of sensorValues) {
                if (response.length > 0) {
                    response = "" + response + "," + sensorValue
                } else {
                    response = sensorValue
                }
            }
            serial.writeLine("" + response)
            state = 2
            radio.setGroup(DISTRICT_ORIGIN)
        }
    }
})

serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    data = serial.readLine()
    if (data == "handshake") {
        if (state == 0) {
            state = 1
            radio.sendString("handshake")
            serial.writeLine("rc="+ control.deviceName() + ":" + DISTRICT_ORIGIN)
            handshakeStartTime = input.runningTime()
        }
    } else if (data.includes('cmd:')) {
        if (state == 2) {
            if (data.includes('cmd:sensor=')) {
                state = 3
                commandStartTime = input.runningTime()
                sensorValues = []
                buffer = data.split(':')
                radio.sendString("" + buffer[1])
            }
            if (data.includes('cmd:intruder=')) {
                let command = data.split(':')
                let commandData = command[1].split('=')
                let districtToSwitch = commandData[1]
                district = parseInt(districtToSwitch)
                state = 4
                radio.setGroup(parseInt(districtToSwitch))
                commandStartTime = input.runningTime()
                sensorValues = []
                radio.sendString("sensor=temp")
                if (globalLD) {
                    radio.sendString('act=globalLD')
                } else {
                    radio.sendString('deact=globalLD')
                }
            }
        }
    } else if (data == 'act=localLD') {
        radio.sendString('act=localLD')
    } else if (data == 'deact=localLD') {
        radio.sendString('deact=localLD')
    } else if (data == 'act=globalLD') {
        globalLD = true
        radio.sendString('act=globalLD')
    } else if (data == 'deact=globalLD') {
        globalLD = false
        radio.sendString('deact=globalLD')
    }
})

radio.onReceivedString(function (receivedString) {
    if (receivedString.includes("enrol=")) {
        if (state == 1) {
            buffer = receivedString.split("=")
            for (let microbitDevice of microbitDevices) {
                if (microbitDevice == buffer[1]) {
                    return
                }
            }
            microbitDevices.push(buffer[1])
        }
    } else {
        if (state == 3) {
            let serialNumber = radio.receivedPacket(RadioPacketProperty.SerialNumber)
            for (let sensorValue of sensorValues) {
                //CHECK IF DEVICE ALREADY EXISTS IN HISTORY
                if (sensorValue.substr(0, 5) == receivedString.substr(0, 5)) {
                    //IF NO. OF HOPS OF NEW MSG IS HIGHER, DISCARD
                    if (parseInt(sensorValue.substr(5, 1)) < parseInt(receivedString.substr(5, 1)) + 1) {
                        return
                    } else {
                        //REPLACE OLD DATA PACKET
                        sensorValue = receivedString + ":" + serialNumber
                        return
                    }
                }
            }
            sensorValues.push(receivedString + ":" + serialNumber)
        } else if (state == 4) {
            let deviceName = receivedString.substr(0, 5)
            let numHops = parseInt(receivedString.substr(5, 1))
            let temp = parseInt(receivedString.substr(6, 2))

            if (numHops == 1) {
                sensorValues.push(deviceName + ":" + district + ":" + temp)
            }

        }
    }
})
