// CONFIGURATION
radio.setGroup(1)
radio.setTransmitPower(1)

let state = 0 //sending out init
let stopWatchCounter = 0
let stopWatchMode = false
let baselineTime = 0
let MAX_HOPS = 31
let hops = 31
let ping_id = 0
let buffer: string[]
let rcvMsgHistory: string[] = [""]
let device_name = control.deviceName()
let device_num = control.deviceSerialNumber()

input.onButtonPressed(Button.AB, function () {
    hops = 0
    sendPingRequest()
})

input.onButtonPressed(Button.A, function () {
    sendCurrentHops(device_name, hops, ping_id)
    rcvMsgHistory.push(device_name + ping_id)
})

radio.onDataPacketReceived(function ({ receivedString }) {
    serial.writeLine("received String: " + receivedString)
    buffer = receivedString.split(",")
    let rsp_name_and_id = buffer[1] + buffer[3]

    if (state === 0) {
        startTimer(3)
        if (buffer[0] === "req") {
            for (let rcvMsg of rcvMsgHistory) {
                if (rcvMsg === rsp_name_and_id) {
                    return
                }
            }
            sendPingResponse(buffer[1])
            if (hops != 0 && hops > parseInt(buffer[2]) && parseInt(buffer[2]) != MAX_HOPS) {
                hops = parseInt(buffer[2]) + 1
                serial.writeLine("hops decreased" + hops)
            }
            rcvMsgHistory.push(rsp_name_and_id)
        }

        if (buffer[0] === "rsp" && buffer[1] == device_name) {
            for (let rcvMsg of rcvMsgHistory) {
                if (rcvMsg === rsp_name_and_id) {
                    return
                }
            }
            if (hops != 0 && hops > parseInt(buffer[3]) && parseInt(buffer[3]) != MAX_HOPS) {
                hops = parseInt(buffer[3]) + 1
                serial.writeLine("hops decreased" + hops)
            }
            rcvMsgHistory.push(rsp_name_and_id)
        }
    }

    if (state === 1) {
        if (buffer[0] === "hops") {
            for (let rcvMsg of rcvMsgHistory) {
                if (rcvMsg === rsp_name_and_id) {
                    return
                }
            }
            sendCurrentHops(device_name, hops, ping_id)
            rcvMsgHistory.push(rsp_name_and_id)
        }
    }

})

function sendPingRequest() {
    serial.writeLine("I (" + device_name + ") sent ping request, hops: " + hops)
    radio.sendString("req," + device_name + "," + hops + "," + ping_id)
    rcvMsgHistory.push(device_name + ping_id)
    ping_id += 1
    basic.pause(500)
}

function sendPingResponse(req_name: string) {
    serial.writeLine("I (" + device_name + ") sent ping response, hops: " + hops)
    radio.sendString("rsp," + req_name + "," + device_name + "," + hops + "," + ping_id)
    ping_id += 1
    basic.pause(500)
}

function sendCurrentHops(device_name: string, hops: number, ping_id: number) {
    radio.sendString("hops," + device_name + "," + hops + "," + ping_id)
    serial.writeLine("I (" + device_name + ") sent hops: " + hops + " , ping_id: " + ping_id)
    ping_id += 1
    basic.pause(500)
}

function startTimer(seconds: number) {

    if (!(stopWatchMode)) {
        baselineTime = input.runningTime()
        stopWatchCounter = 0
        stopWatchMode = true
    }

}

basic.forever(() => {

    if (stopWatchMode) {
        if (input.runningTime() - baselineTime >= 1000) {
            baselineTime = input.runningTime()
            stopWatchCounter += 1
            basic.showNumber(stopWatchCounter)
            sendPingRequest()
            if (stopWatchCounter === 5) {
                stopWatchCounter = 0
                stopWatchMode = false
                state = 1
            }
        }
    }

})
