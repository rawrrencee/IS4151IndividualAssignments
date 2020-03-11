/* INIT VARIABLES */
let state = 0 //Waiting for Pairing
let deviceName = control.deviceName()
let playerDetails: string
let buffer1: string[]
let xCoord = 0
let yCoord = 0

/* CONFIGURE */
radio.setGroup(7)
radio.setTransmitPower(7)

/* STARTING METHODS */
input.onButtonPressed(Button.A, function () {
    if (state === 0) {
        pairWithController()
    }
    if (state === 4 || state === 5) {
        if (xCoord < 9) {
            xCoord += 1
        } else {
            xCoord = 0
        }
        showLEDpattern(xCoord, yCoord)
    }
})

input.onButtonPressed(Button.B, function () {
    if (state === 4 || state === 5) {
        if (yCoord < 9) {
            yCoord += 1
        } else {
            yCoord = 0
        }
        showLEDpattern(xCoord, yCoord)
    }
})

input.onButtonPressed(Button.AB, function () {
    if (state === 4) {
        radio.sendString("" + deviceName + "," + "FM" + "," + xCoord + "," + yCoord)
    } else if (state === 5) {
        radio.sendString("" + deviceName + "," + "SM" + "," + xCoord + "," + yCoord)
    }
})

radio.onDataPacketReceived(function ({ receivedString }) {
    buffer1 = receivedString.split(",")

    //Pairing stage
    if (state === 0) {
        if (buffer1[0] === deviceName) {
            if (buffer1[1] === "P1") {
                state = 1 //Pairing success, waiting for game as P1
                playerDetails = "P1"
                basic.showNumber(1)
            } else if (buffer1[1] === "P2") {
                state = 2 //Pairing success, waiting for game as P2
                playerDetails = "P2"
                basic.showNumber(2)
            }
        }
    }

    //Starting series
    if (state === 1 || state === 2) {
        serial.writeLine(receivedString)
        if (buffer1[0] === deviceName) {
            if (buffer1[1] === "NSS") {
                basic.showIcon(IconNames.Tortoise)
            } else if (buffer1[1] === "RGR") {
                state = 3 //Received Game Request
                basic.showIcon(IconNames.Chessboard)
            }
        }
    }

    if (state === 3) {
        if (buffer1[0] === deviceName) {
            if (buffer1[1] === "FM") {
                state = 4 //Playing as Move 1/2
                basic.showLeds(`
                    . . # . .
                    # . . # #
                    # . . . #
                    # . . # .
                    # . . # #
                    `)
            } else if (buffer1[1] === "SM") {
                state = 5 //Playing as Move 2/2
                basic.showLeds(`
                    . . # . .
                    # # . # #
                    . # . . #
                    # . . # .
                    # # . # #
                    `)
                basic.pause(500)
                basic.showString("")
            }
        }
    }

    if (state === 4) {
        if (buffer1[0] === deviceName) {
            if (buffer1[1] === "FFM") {
                basic.showString("")
            }
            if (buffer1[1] === "FM") {
                basic.showLeds(`
                    . . # . .
                    # . . # #
                    # . . . #
                    # . . # .
                    # . . # #
                    `)
            }
        }
    }

    if (state === 5) {
        if (buffer1[0] === deviceName) {
            if (buffer1[1] === "WSM") {
                basic.showLeds(`
                    . . # . .
                    # # . # #
                    . # . . #
                    # . . # .
                    # # . # #
                    `)
            }
            if (buffer1[1] === "FSM") {
                basic.showString("")
            }
        }
    }

    if (state === 4 || state === 5) {
        if (buffer1[0] === deviceName) {
            if (buffer1[1] === "STOP") {
                serial.writeLine(receivedString)
                if (playerDetails === "P1") {
                    basic.showNumber(1)
                    state = 1
                } else if (playerDetails === "P2") {
                    basic.showNumber(2)
                    state = 2
                }
            }
        }
    }
})

function pairWithController() {
    radio.sendString(deviceName)
}

function showLEDpattern(xCoord: number, yCoord: number) {

    if (xCoord === 0 && yCoord === 0) {
        basic.showLeds(`
                # # . # #
                # # . # #
                # # . # #
                # # . # #
                # # . # #
                `)
    }
    if (xCoord === 0 && yCoord === 1) {
        basic.showLeds(`
                # # . . #
                # # . . #
                # # . . #
                # # . . #
                # # . . #
                `)
    }
    if (xCoord === 0 && yCoord === 2) {
        basic.showLeds(`
                # # . # #
                # # . . #
                # # . # #
                # # . # .
                # # . # #
                `)
    }
    if (xCoord === 0 && yCoord === 3) {
        basic.showLeds(`
                # # . # #
                # # . . #
                # # . # #
                # # . . #
                # # . # #
                `)
    }
    if (xCoord === 0 && yCoord === 4) {
        basic.showLeds(`
                # # . # .
                # # . # .
                # # . # #
                # # . . #
                # # . . #
                `)
    }
    if (xCoord === 0 && yCoord === 5) {
        basic.showLeds(`
                # # . # #
                # # . # .
                # # . # #
                # # . . #
                # # . # #
                `)
    }
    if (xCoord === 0 && yCoord === 6) {
        basic.showLeds(`
                # # . # #
                # # . # .
                # # . # #
                # # . # #
                # # . # #
                `)
    }
    if (xCoord === 0 && yCoord === 7) {
        basic.showLeds(`
                # # . # #
                # # . . #
                # # . . #
                # # . . #
                # # . . #
                `)
    }
    if (xCoord === 0 && yCoord === 8) {
        basic.showLeds(`
                # # . # #
                # # . # #
                # # . . .
                # # . # #
                # # . # #
                `)
    }
    if (xCoord === 0 && yCoord === 9) {
        basic.showLeds(`
                # # . # #
                # # . # #
                # # . # #
                # # . . #
                # # . # #
                `)
    }


    if (xCoord === 1 && yCoord === 0) {
        basic.showLeds(`
                # . . # #
                # . . # #
                # . . # #
                # . . # #
                # . . # #
                `)
    }
    if (xCoord === 1 && yCoord === 1) {
        basic.showLeds(`
                # . . . #
                # . . . #
                # . . . #
                # . . . #
                # . . . #
                `)
    }
    if (xCoord === 1 && yCoord === 2) {
        basic.showLeds(`
                # . . # #
                # . . . #
                # . . # #
                # . . # .
                # . . # #
                `)
    }
    if (xCoord === 1 && yCoord === 3) {
        basic.showLeds(`
                # . . # #
                # . . . #
                # . . # #
                # . . . #
                # . . # #
                `)
    }
    if (xCoord === 1 && yCoord === 4) {
        basic.showLeds(`
                # . . # .
                # . . # .
                # . . # #
                # . . . #
                # . . . #
                `)
    }
    if (xCoord === 1 && yCoord === 5) {
        basic.showLeds(`
                # . . # #
                # . . # .
                # . . # #
                # . . . #
                # . . # #
                `)
    }
    if (xCoord === 1 && yCoord === 6) {
        basic.showLeds(`
                # . . # #
                # . . # .
                # . . # #
                # . . # #
                # . . # #
                `)
    }
    if (xCoord === 1 && yCoord === 7) {
        basic.showLeds(`
                # . . # #
                # . . . #
                # . . . #
                # . . . #
                # . . . #
                `)
    }
    if (xCoord === 1 && yCoord === 8) {
        basic.showLeds(`
                # . . # #
                # . . # #
                # . . . .
                # . . # #
                # . . # #
                `)
    }
    if (xCoord === 1 && yCoord === 9) {
        basic.showLeds(`
                # . . # #
                # . . # #
                # . . # #
                # . . . #
                # . . # #
                `)
    }

    if (xCoord === 2 && yCoord === 0) {
        basic.showLeds(`
                # # . # #
                . # . # #
                # # . # #
                # . . # #
                # # . # #
                `)
    }
    if (xCoord === 2 && yCoord === 1) {
        basic.showLeds(`
                # # . . #
                . # . . #
                # # . . #
                # . . . #
                # # . . #
                `)
    }
    if (xCoord === 2 && yCoord === 2) {
        basic.showLeds(`
                # # . # #
                . # . . #
                # # . # #
                # . . # .
                # # . # #
                `)
    }
    if (xCoord === 2 && yCoord === 3) {
        basic.showLeds(`
                # # . # #
                . # . . #
                # # . # #
                # . . . #
                # # . # #
                `)
    }
    if (xCoord === 2 && yCoord === 4) {
        basic.showLeds(`
                # # . # .
                . # . # .
                # # . # #
                # . . . #
                # # . . #
                `)
    }
    if (xCoord === 2 && yCoord === 5) {
        basic.showLeds(`
                # # . # #
                . # . # .
                # # . # #
                # . . . #
                # # . # #
                `)
    }
    if (xCoord === 2 && yCoord === 6) {
        basic.showLeds(`
                # # . # #
                . # . # .
                # # . # #
                # . . # #
                # # . # #
                `)
    }
    if (xCoord === 2 && yCoord === 7) {
        basic.showLeds(`
                # # . # #
                . # . . #
                # # . . #
                # . . . #
                # # . . #
                `)
    }
    if (xCoord === 2 && yCoord === 8) {
        basic.showLeds(`
                # # . # #
                . # . # #
                # # . . .
                # . . # #
                # # . # #
                `)
    }
    if (xCoord === 2 && yCoord === 9) {
        basic.showLeds(`
                # # . # #
                . # . # #
                # # . # #
                # . . . #
                # # . # #
                `)
    }

    if (xCoord === 3 && yCoord === 0) {
        basic.showLeds(`
                # # . # #
                . # . # #
                # # . # #
                . # . # #
                # # . # #
                `)
    }
    if (xCoord === 3 && yCoord === 1) {
        basic.showLeds(`
                # # . . #
                . # . . #
                # # . . #
                . # . . #
                # # . . #
                `)
    }
    if (xCoord === 3 && yCoord === 2) {
        basic.showLeds(`
                # # . # #
                . # . . #
                # # . # #
                . # . # .
                # # . # #
                `)
    }
    if (xCoord === 3 && yCoord === 3) {
        basic.showLeds(`
                # # . # #
                . # . . #
                # # . # #
                . # . . #
                # # . # #
                `)
    }
    if (xCoord === 3 && yCoord === 4) {
        basic.showLeds(`
                # # . # .
                . # . # .
                # # . # #
                . # . . #
                # # . . #
                `)
    }
    if (xCoord === 3 && yCoord === 5) {
        basic.showLeds(`
                # # . # #
                . # . # .
                # # . # #
                . # . . #
                # # . # #
                `)
    }
    if (xCoord === 3 && yCoord === 6) {
        basic.showLeds(`
                # # . # #
                . # . # .
                # # . # #
                . # . # #
                # # . # #
                `)
    }
    if (xCoord === 3 && yCoord === 7) {
        basic.showLeds(`
                # # . # #
                . # . . #
                # # . . #
                . # . . #
                # # . . #
                `)
    }
    if (xCoord === 3 && yCoord === 8) {
        basic.showLeds(`
                # # . # #
                . # . # #
                # # . . .
                . # . # #
                # # . # #
                `)
    }
    if (xCoord === 3 && yCoord === 9) {
        basic.showLeds(`
                # # . # #
                . # . # #
                # # . # #
                . # . . #
                # # . # #
                `)
    }

    if (xCoord === 4 && yCoord === 0) {
        basic.showLeds(`
                # . . # #
                # . . # #
                # # . # #
                . # . # #
                . # . # #
                `)
    }
    if (xCoord === 4 && yCoord === 1) {
        basic.showLeds(`
                # . . . #
                # . . . #
                # # . . #
                . # . . #
                . # . . #
                `)
    }
    if (xCoord === 4 && yCoord === 2) {
        basic.showLeds(`
                # . . # #
                # . . . #
                # # . # #
                . # . # .
                . # . # #
                `)
    }
    if (xCoord === 4 && yCoord === 3) {
        basic.showLeds(`
                # . . # #
                # . . . #
                # # . # #
                . # . . #
                . # . # #
                `)
    }
    if (xCoord === 4 && yCoord === 4) {
        basic.showLeds(`
                # . . # .
                # . . # .
                # # . # #
                . # . . #
                . # . . #
                `)
    }
    if (xCoord === 4 && yCoord === 5) {
        basic.showLeds(`
                # . . # #
                # . . # .
                # # . # #
                . # . . #
                . # . # #
                `)
    }
    if (xCoord === 4 && yCoord === 6) {
        basic.showLeds(`
                # . . # #
                # . . # .
                # # . # #
                . # . # #
                . # . # #
                `)
    }
    if (xCoord === 4 && yCoord === 7) {
        basic.showLeds(`
                # . . # #
                # . . . #
                # # . . #
                . # . . #
                . # . . #
                `)
    }
    if (xCoord === 4 && yCoord === 8) {
        basic.showLeds(`
                # . . # #
                # . . # #
                # # . . .
                . # . # #
                . # . # #
                `)
    }
    if (xCoord === 4 && yCoord === 9) {
        basic.showLeds(`
                # . . # #
                # . . # #
                # # . # #
                . # . . #
                . # . # #
                `)
    }

    if (xCoord === 5 && yCoord === 0) {
        basic.showLeds(`
                # # . # #
                # . . # #
                # # . # #
                . # . # #
                # # . # #
                `)
    }
    if (xCoord === 5 && yCoord === 1) {
        basic.showLeds(`
                # # . . #
                # . . . #
                # # . . #
                . # . . #
                # # . . #
                `)
    }
    if (xCoord === 5 && yCoord === 2) {
        basic.showLeds(`
                # # . # #
                # . . . #
                # # . # #
                . # . # .
                # # . # #
                `)
    }
    if (xCoord === 5 && yCoord === 3) {
        basic.showLeds(`
                # # . # #
                # . . . #
                # # . # #
                . # . . #
                # # . # #
                `)
    }
    if (xCoord === 5 && yCoord === 4) {
        basic.showLeds(`
                # # . # .
                # . . # .
                # # . # #
                . # . . #
                # # . . #
                `)
    }
    if (xCoord === 5 && yCoord === 5) {
        basic.showLeds(`
                # # . # #
                # . . # .
                # # . # #
                . # . . #
                # # . # #
                `)
    }
    if (xCoord === 5 && yCoord === 6) {
        basic.showLeds(`
                # # . # #
                # . . # .
                # # . # #
                . # . # #
                # # . # #
                `)
    }
    if (xCoord === 5 && yCoord === 7) {
        basic.showLeds(`
                # # . # #
                # . . . #
                # # . . #
                . # . . #
                # # . . #
                `)
    }
    if (xCoord === 5 && yCoord === 8) {
        basic.showLeds(`
                # # . # #
                # . . # #
                # # . . .
                . # . # #
                # # . # #
                `)
    }
    if (xCoord === 5 && yCoord === 9) {
        basic.showLeds(`
                # # . # #
                # . . # #
                # # . # #
                . # . . #
                # # . # #
                `)
    }

    if (xCoord === 6 && yCoord === 0) {
        basic.showLeds(`
                # # . # #
                # . . # #
                # # . # #
                # # . # #
                # # . # #
                `)
    }
    if (xCoord === 6 && yCoord === 1) {
        basic.showLeds(`
                # # . . #
                # . . . #
                # # . . #
                # # . . #
                # # . . #
                `)
    }
    if (xCoord === 6 && yCoord === 2) {
        basic.showLeds(`
                # # . # #
                # . . . #
                # # . # #
                # # . # .
                # # . # #
                `)
    }
    if (xCoord === 6 && yCoord === 3) {
        basic.showLeds(`
                # # . # #
                # . . . #
                # # . # #
                # # . . #
                # # . # #
                `)
    }
    if (xCoord === 6 && yCoord === 4) {
        basic.showLeds(`
                # # . # .
                # . . # .
                # # . # #
                # # . . #
                # # . . #
                `)
    }
    if (xCoord === 6 && yCoord === 5) {
        basic.showLeds(`
                # # . # #
                # . . # .
                # # . # #
                # # . . #
                # # . # #
                `)
    }
    if (xCoord === 6 && yCoord === 6) {
        basic.showLeds(`
                # # . # #
                # . . # .
                # # . # #
                # # . # #
                # # . # #
                `)
    }
    if (xCoord === 6 && yCoord === 7) {
        basic.showLeds(`
                # # . # #
                # . . . #
                # # . . #
                # # . . #
                # # . . #
                `)
    }
    if (xCoord === 6 && yCoord === 8) {
        basic.showLeds(`
                # # . # #
                # . . # #
                # # . . .
                # # . # #
                # # . # #
                `)
    }
    if (xCoord === 6 && yCoord === 9) {
        basic.showLeds(`
                # # . # #
                # . . # #
                # # . # #
                # # . . #
                # # . # #
                `)
    }

    if (xCoord === 7 && yCoord === 0) {
        basic.showLeds(`
                # # . # #
                . # . # #
                . # . # #
                . # . # #
                . # . # #
                `)
    }
    if (xCoord === 7 && yCoord === 1) {
        basic.showLeds(`
                # # . . #
                . # . . #
                . # . . #
                . # . . #
                . # . . #
                `)
    }
    if (xCoord === 7 && yCoord === 2) {
        basic.showLeds(`
                # # . # #
                . # . . #
                . # . # #
                . # . # .
                . # . # #
                `)
    }
    if (xCoord === 7 && yCoord === 3) {
        basic.showLeds(`
                # # . # #
                . # . . #
                . # . # #
                . # . . #
                . # . # #
                `)
    }
    if (xCoord === 7 && yCoord === 4) {
        basic.showLeds(`
                # # . # .
                . # . # .
                . # . # #
                . # . . #
                . # . . #
                `)
    }
    if (xCoord === 7 && yCoord === 5) {
        basic.showLeds(`
                # # . # #
                . # . # .
                . # . # #
                . # . . #
                . # . # #
                `)
    }
    if (xCoord === 7 && yCoord === 6) {
        basic.showLeds(`
                # # . # #
                . # . # .
                . # . # #
                . # . # #
                . # . # #
                `)
    }
    if (xCoord === 7 && yCoord === 7) {
        basic.showLeds(`
                # # . # #
                . # . . #
                . # . . #
                . # . . #
                . # . . #
                `)
    }
    if (xCoord === 7 && yCoord === 8) {
        basic.showLeds(`
                # # . # #
                . # . # #
                . # . . .
                . # . # #
                . # . # #
                `)
    }
    if (xCoord === 7 && yCoord === 9) {
        basic.showLeds(`
                # # . # #
                . # . # #
                . # . # #
                . # . . #
                . # . # #
                `)
    }

    if (xCoord === 8 && yCoord === 0) {
        basic.showLeds(`
                # # . # #
                # # . # #
                . . . # #
                # # . # #
                # # . # #
                `)
    }
    if (xCoord === 8 && yCoord === 1) {
        basic.showLeds(`
                # # . . #
                # # . . #
                . . . . #
                # # . . #
                # # . . #
                `)
    }
    if (xCoord === 8 && yCoord === 2) {
        basic.showLeds(`
                # # . # #
                # # . . #
                . . . # #
                # # . # .
                # # . # #
                `)
    }
    if (xCoord === 8 && yCoord === 3) {
        basic.showLeds(`
                # # . # #
                # # . . #
                . . . # #
                # # . . #
                # # . # #
                `)
    }
    if (xCoord === 8 && yCoord === 4) {
        basic.showLeds(`
                # # . # .
                # # . # .
                . . . # #
                # # . . #
                # # . . #
                `)
    }
    if (xCoord === 8 && yCoord === 5) {
        basic.showLeds(`
                # # . # #
                # # . # .
                . . . # #
                # # . . #
                # # . # #
                `)
    }
    if (xCoord === 8 && yCoord === 6) {
        basic.showLeds(`
                # # . # #
                # # . # .
                . . . # #
                # # . # #
                # # . # #
                `)
    }
    if (xCoord === 8 && yCoord === 7) {
        basic.showLeds(`
                # # . # #
                # # . . #
                . . . . #
                # # . . #
                # # . . #
                `)
    }
    if (xCoord === 8 && yCoord === 8) {
        basic.showLeds(`
                # # . # #
                # # . # #
                . . . . .
                # # . # #
                # # . # #
                `)
    }
    if (xCoord === 8 && yCoord === 9) {
        basic.showLeds(`
                # # . # #
                # # . # #
                . . . # #
                # # . . #
                # # . # #
                `)
    }


    if (xCoord === 9 && yCoord === 0) {
        basic.showLeds(`
                # # . # #
                # # . # #
                # # . # #
                . # . # #
                # # . # #
                `)
    }
    if (xCoord === 9 && yCoord === 1) {
        basic.showLeds(`
                # # . . #
                # # . . #
                # # . . #
                . # . . #
                # # . . #
                `)
    }
    if (xCoord === 9 && yCoord === 2) {
        basic.showLeds(`
                # # . # #
                # # . . #
                # # . # #
                . # . # .
                # # . # #
                `)
    }
    if (xCoord === 9 && yCoord === 3) {
        basic.showLeds(`
                # # . # #
                # # . . #
                # # . # #
                . # . . #
                # # . # #
                `)
    }
    if (xCoord === 9 && yCoord === 4) {
        basic.showLeds(`
                # # . # .
                # # . # .
                # # . # #
                . # . . #
                # # . . #
                `)
    }
    if (xCoord === 9 && yCoord === 5) {
        basic.showLeds(`
                # # . # #
                # # . # .
                # # . # #
                . # . . #
                # # . # #
                `)
    }
    if (xCoord === 9 && yCoord === 6) {
        basic.showLeds(`
                # # . # #
                # # . # .
                # # . # #
                . # . # #
                # # . # #
                `)
    }
    if (xCoord === 9 && yCoord === 7) {
        basic.showLeds(`
                # # . # #
                # # . . #
                # # . . #
                . # . . #
                # # . . #
                `)
    }
    if (xCoord === 9 && yCoord === 8) {
        basic.showLeds(`
                # # . # #
                # # . # #
                # # . . .
                . # . # #
                # # . # #
                `)
    }
    if (xCoord === 9 && yCoord === 9) {
        basic.showLeds(`
                # # . # #
                # # . # #
                # # . # #
                . # . . #
                # # . # #
                `)
    }
}

basic.showIcon(IconNames.SmallHeart)
basic.forever(function () {
})
