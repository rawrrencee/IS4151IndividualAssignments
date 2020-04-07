// CONFIGURATION
radio.setGroup(1)
radio.setTransmitPower(1)

let state = 0 //sending out init
let stopWatchCounter = 0
let stopWatchMode = false
let baselineTime = 0
let MAX_HOPS = 5
let hops = MAX_HOPS
let ping_id = 0
let buffer: string[]
let receivedMsgHistory: string[] = [""]
let device_name = control.deviceName()
let device_num = control.deviceSerialNumber()

input.onButtonPressed(Button.AB, function () {
    hops = 0
    sendPingRequest()
})

input.onButtonPressed(Button.A, function () {
    sendOwnHops()
})

input.onButtonPressed(Button.B, function () {
    if (state === 0) {
        requestToJoin()
    }
})

radio.onDataPacketReceived(function ({ receivedString }) {
    serial.writeLine("received String: " + receivedString)
    buffer = receivedString.split(",")
    let received_name_and_id = buffer[1] + buffer[3]

    if (state === 0) {
        startTimer()
        if (buffer[0] === "req") {
            for (let receivedMsg of receivedMsgHistory) {
                if (receivedMsg === received_name_and_id) {
                    return
                }
            }
            sendPingResponse(buffer[1])
            if (hops != 0 && hops > parseInt(buffer[2]) && parseInt(buffer[2]) != MAX_HOPS) {
                hops = parseInt(buffer[2]) + 1
            }
            receivedMsgHistory.push(received_name_and_id)
        }

        if (buffer[0] === "rsp" && buffer[1] == device_name) {
            for (let receivedMsg of receivedMsgHistory) {
                if (receivedMsg === received_name_and_id) {
                    return
                }
            }
            if (hops != 0 && hops > parseInt(buffer[3]) && parseInt(buffer[3]) != MAX_HOPS) {
                hops = parseInt(buffer[3]) + 1
            }
            receivedMsgHistory.push(received_name_and_id)
        }
    }

    if (state === 1) {
        startTimer()
        if (buffer[0] === "hops") {
            for (let receivedMsg of receivedMsgHistory) {
                if (receivedMsg === received_name_and_id) {
                    return
                }
            }
            serial.writeLine("forward: name- " + buffer[1] + " , hops" + parseInt(buffer[2]) + " , msg_id" + parseInt(buffer[3]))
            fwdReceivedHops(buffer[1], parseInt(buffer[2]), parseInt(buffer[3]))
            receivedMsgHistory.push(received_name_and_id)
        }
        if (buffer[0] === "temp") {
            for (let receivedMsg of receivedMsgHistory) {
                if (receivedMsg === received_name_and_id) {
                    return
                }
            }
            fwdReceivedTemp(buffer[1], parseInt(buffer[2]), parseInt(buffer[3]))
            receivedMsgHistory.push(received_name_and_id)
        }
    }

    if (state === 2) {
        startTimer()
        if (buffer[0] === "join") {
            state = 0
        }
        if (buffer[0] === "hops") {
            for (let receivedMsg of receivedMsgHistory) {
                if (receivedMsg === received_name_and_id) {
                    return
                }
            }
            serial.writeLine("forward: name- " + buffer[1] + " , hops" + parseInt(buffer[2]) + " , msg_id" + parseInt(buffer[3]))
            fwdReceivedHops(buffer[1], parseInt(buffer[2]), parseInt(buffer[3]))
            receivedMsgHistory.push(received_name_and_id)
        }
    }

})

function sendPingRequest() {
    serial.writeLine("I (" + device_name + ") sent ping request with my ping_id: " + ping_id + ", hops: " + hops)
    radio.sendString("req," + device_name + "," + hops + "," + ping_id)
    receivedMsgHistory.push(device_name + ping_id)
    ping_id += 1
    basic.pause(500)
}

function sendPingResponse(req_name: string) {
    serial.writeLine("I (" + device_name + ") sent ping response with my ping_id: " + ping_id + ", hops: " + hops)
    radio.sendString("rsp," + req_name + "," + device_name + "," + hops + "," + ping_id)
    ping_id += 1
    basic.pause(500)
}

function sendOwnHops() {
    radio.sendString("hops," + device_name + "," + hops + "," + ping_id)
    receivedMsgHistory.push(device_name + ping_id)
    ping_id += 1
    basic.pause(500)
}

function fwdReceivedHops(intended_device_name: string, intended_hops: number, intended_ping_id: number) {
    radio.sendString("hops," + intended_device_name + "," + intended_hops + "," + intended_ping_id)
    serial.writeLine("I (" + intended_device_name + ") sent hops: " + intended_hops + " , my ping_id: " + intended_ping_id)
    basic.pause(500)
}

function sendOwnTemp() {
    radio.sendString("temp," + device_name + "," + input.temperature() + "," + ping_id)
    serial.writeLine("I (" + device_name + ") sent temp: " + input.temperature() + " , my ping_id: " + ping_id)
    ping_id += 1
    basic.pause(500)
}

function fwdReceivedTemp(intended_device_name: string, intended_temperature: number, intended_ping_id: number) {
    radio.sendString("temp," + intended_device_name + "," + intended_temperature + "," + intended_ping_id)
    serial.writeLine("I (" + intended_device_name + ") sent temp: " + intended_temperature + " , my ping_id: " + intended_ping_id)
    basic.pause(500)
}

function requestToJoin() {
    serial.writeLine("I (" + device_name + ") sent interim join request with my ping_id: " + ping_id + ", hops: " + hops)
    radio.sendString("join," + device_name + "," + hops + "," + ping_id)
    receivedMsgHistory.push(device_name + ping_id)
    ping_id += 1
    basic.pause(500)
}

function startTimer() {

    if (!(stopWatchMode)) {
        baselineTime = input.runningTime()
        stopWatchCounter = 0
        stopWatchMode = true
    }

}

basic.forever(() => {

    if (stopWatchMode) {

        if (state === 0) {
            if (input.runningTime() - baselineTime >= 1000) {
                baselineTime = input.runningTime()
                stopWatchCounter += 1
                basic.showNumber(stopWatchCounter)
                sendPingRequest()
                if (stopWatchCounter === MAX_HOPS) {
                    stopWatchCounter = 0
                    stopWatchMode = false
                    state = 1
                }
            }
        }

        else if (state === 1) {
            if (input.runningTime() - baselineTime >= 1000) {
                baselineTime = input.runningTime()
                stopWatchCounter += 1
                basic.showNumber(stopWatchCounter)
                sendOwnHops()
                sendOwnTemp()
                if (stopWatchCounter === 5) {
                    stopWatchCounter = 0
                    stopWatchMode = false
                    state = 2
                }
            }
        }
    }

})
