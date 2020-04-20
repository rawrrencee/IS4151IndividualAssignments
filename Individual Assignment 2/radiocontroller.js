
let state = 0
let microbitDevices: string[] = []
let sensorValues: string[] = []
let handshakeStartTime = 0
let commandStartTime = 0
let data = ""
let response = ""
let buffer: string[] = []
let msgHistory: string[] = []

//CONFIGURATION
radio.setGroup(1)
radio.setTransmitPower(1)
radio.setTransmitSerialNumber(true)
basic.showIcon(IconNames.Yes)

basic.forever(function () {
    basic.showNumber(state)

    if (state == 1) {
        if (input.runningTime() - handshakeStartTime > 10 * 1000) {
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
        if (input.runningTime() - commandStartTime > 25 * 1000) {
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
    }
})

serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    data = serial.readLine()
    if (data == "handshake") {
        if (state == 0) {
            state = 1
            radio.sendString("handshake")
            handshakeStartTime = input.runningTime()
        }
    } else if (data.includes('cmd:')) {
        if (state == 2) {
            if (data.includes('cmd:sensor=')) {
                state = 3
                commandStartTime = input.runningTime()
                sensorValues = []
            }
            buffer = data.split(':')
            radio.sendString("" + buffer[1])
        }
    }
})

radio.onReceivedString(function (receivedString) {
    if (receivedString.includes("enrol=")) {
        if (state == 1) {
            buffer = receivedString.split("=")
            microbitDevices.push(buffer[1])
        }
    } else {
        if (state == 3) {
            let serialNumber = radio.receivedPacket(RadioPacketProperty.SerialNumber)
            for (let sensorValue of sensorValues) {
                //CHECK IF DEVICE ALREADY EXISTS IN HISTORY
                if (sensorValue.substr(0, 4) == receivedString.substr(0, 4)) {
                    //IF NO. OF HOPS OF NEW MSG IS HIGHER, DISCARD
                    if (parseInt(sensorValue.substr(5, 5)) < parseInt(receivedString.substr(5, 5)) + 1) {
                        return
                    } else {
                        //REPLACE OLD DATA PACKET
                        sensorValue = receivedString + ":" + serialNumber
                        return
                    }
                }
            }
            sensorValues.push(receivedString + ":" + serialNumber)
        }
    }
})
