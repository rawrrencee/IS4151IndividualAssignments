0/* INIT VARIABLES */
let state = 0 //Waiting for Pairing
let terminalResp = ""
let buffer1: string[]
let playerOneDetails: string
let playerTwoDetails: string
let display: grove.TM1637 = null
let boardSize = 3
let playOrder = 0
let board: number[] = []
let totalBoardSize = 0
let xCoord = 0
let yCoord = 0
let boardIndexToMark = 0
let boardIndexToCheckWin = 0
let playerOneScore = 0
let playerTwoScore = 0


/* CONFIGURE */
radio.setGroup(7)
radio.setTransmitPower(7)

/* STARTING METHODS */
initHandshake()

/* RECEIVING DATA */
radio.onDataPacketReceived(function ({ receivedString }) {
    buffer1 = receivedString.split(",")

    if (state === 1) {
        playerOneDetails = buffer1[0]
        serial.writeLine(playerOneDetails + " has been set as Player One")
        serial.writeLine("Waiting to pair with Player 2...")
        state = 2 //Paired with Player 1
        radio.sendString("" + playerOneDetails + "," + "P1")
        return
    }
    if (state === 2) {
        if (buffer1[0] === playerOneDetails) {
            serial.writeLine("Player " + buffer1[0] + " has already been set as Player One")
            serial.writeLine("Waiting to pair with Player 2...")
        } else {
            playerTwoDetails = buffer1[0]
            serial.writeLine(playerTwoDetails + " has been set as Player Two")
            state = 3 //Paired with Player 2
            radio.sendString("" + playerTwoDetails + "," + "P2")
            serial.writeLine("Welcome to TicTacToe! *Splash* Press A+B to start")
            basic.showIcon(IconNames.Heart)
        }
    }
    if (state === 6) {
        if (playOrder === 1) {
            if (buffer1[0] === playerOneDetails && buffer1[1] === "FM") {
                if (!checkBoardOccupancy(buffer1[2], buffer1[3])) {
                    printCurrentBoard()
                    serial.writeLine("ERROR IN MOVE 1/2: Player One marked occupied (" + buffer1[2] + "," + buffer1[3] + ")")
                    serial.writeLine("Move 1/2: Player One, please mark another coordinate.")
                    return
                } else {
                    radio.sendString("" + playerOneDetails + "," + "FFM") //Player One = Move 1/2 (Finished First Move)
                    serial.writeLine("Move 1/2: Player One marked (" + buffer1[2] + "," + buffer1[3] + ")")
                    markBoard(buffer1[2], buffer1[3], playerOneDetails)
                    printCurrentBoard()
                    if (checkWin(buffer1[2], buffer1[3], playerOneDetails)) {
                        return
                    }
                    if (checkDraw) {

                    }
                    radio.sendString("" + playerTwoDetails + "," + "WSM") //Player Two = Move 2/2 (Waiting Second Move)
                    serial.writeLine("Waiting for Player Two to make Move 2/2...")
                    state = 7 //Received Move 1/2, Waiting for Move 2/2
                }
            }
        } else {
            if (buffer1[0] === playerTwoDetails && buffer1[1] === "FM") {
                if (!checkBoardOccupancy(buffer1[2], buffer1[3])) {
                    printCurrentBoard()
                    serial.writeLine("ERROR IN MOVE 1/2: Player Two marked occupied (" + buffer1[2] + "," + buffer1[3] + ")")
                    serial.writeLine("Move 1/2: Player Two, please mark another coordinate.")
                    return
                } else {
                    radio.sendString("" + playerTwoDetails + "," + "FFM") //Player Two = Move 1/2 (Finished First Move)
                    serial.writeLine("Move 1/2: Player Two marked (" + buffer1[2] + "," + buffer1[3] + ")")
                    markBoard(buffer1[2], buffer1[3], playerTwoDetails)
                    printCurrentBoard()
                    if (checkWin(buffer1[2], buffer1[3], playerTwoDetails)) {
                        return
                    }

                    radio.sendString("" + playerOneDetails + "," + "WSM") //Player Two = Move 2/2 (Waiting Second Move)
                    serial.writeLine("Waiting for Player One to make Move 2/2...")
                    state = 7 //Received Move 1/2, Waiting for Move 2/2
                }
            }
        }
    }

    if (state === 7) {
        if (playOrder === 1) {
            if (buffer1[0] === playerTwoDetails && buffer1[1] === "SM") {
                if (!checkBoardOccupancy(buffer1[2], buffer1[3])) {
                    printCurrentBoard()
                    serial.writeLine("ERROR IN MOVE 2/2: Player Two marked occupied (" + buffer1[2] + "," + buffer1[3] + ")")
                    serial.writeLine("Move 2/2: Player Two, please mark another coordinate.")
                    return
                } else {
                    radio.sendString("" + playerTwoDetails + "," + "FSM") //Player Two = Move 2/2 (Finished Second Move)
                    serial.writeLine("Move 2/2: Player Two marked (" + buffer1[2] + "," + buffer1[3] + ")")
                    markBoard(buffer1[2], buffer1[3], playerTwoDetails)
                    printCurrentBoard()
                    if (checkWin(buffer1[2], buffer1[3], playerTwoDetails)) {
                        return
                    }

                    state = 6 //Received Move 2/2, Waiting for Move 1/2
                    sendFirstMove(playerOneDetails)
                    serial.writeLine("Waiting for Player One to make Move 1/2...")
                }
            }
        } else {
            if (buffer1[0] === playerOneDetails && buffer1[1] === "SM") {
                if (!checkBoardOccupancy(buffer1[2], buffer1[3])) {
                    printCurrentBoard()
                    serial.writeLine("ERROR IN MOVE 2/2: Player One marked occupied (" + buffer1[2] + "," + buffer1[3] + ")")
                    serial.writeLine("Move 2/2: Player One, please mark another coordinate.")
                    return
                } else {
                    radio.sendString("" + playerOneDetails + "," + "FSM") //Player Two = Move 2/2 (Finished Second Move)
                    serial.writeLine("Move 2/2: Player One marked (" + buffer1[2] + "," + buffer1[3] + ")")
                    markBoard(buffer1[2], buffer1[3], playerOneDetails)
                    printCurrentBoard()
                    if (checkWin(buffer1[2], buffer1[3], playerOneDetails)) {
                        return
                    }

                    state = 6 //Received Move 2/2, Waiting for Move 1/2
                    sendFirstMove(playerTwoDetails)
                    serial.writeLine("Waiting for Player Two to make Move 1/2...")
                }
            }
        }
    }
})

/* RECEIVING INPUT */
input.onButtonPressed(Button.AB, function () {
    if (state === 3) {
        state = 4 //New Series Started (NSS)
        serial.writeLine("New series started. Notifying players...")
        //NSS = New Series Started
        playerOneScore = 0
        playerTwoScore = 0
        radio.sendString("" + playerOneDetails + "," + "NSS")
        radio.sendString("" + playerTwoDetails + "," + "NSS")
        display = grove.createDisplay(DigitalPin.P2, DigitalPin.P16)
        display.bit(0, 0)
        display.bit(0, 1)
        display.bit(0, 2)
        display.bit(0, 3)
        basic.showIcon(IconNames.Yes)
        serial.writeLine("Press A to begin new game.")
    } else if (state === 4) {
        serial.writeLine("Series ended.")
        if (playerOneScore > playerTwoScore) {
            serial.writeLine("Final winner is Player One! Resetting in 5 seconds...")
            radio.sendString("" + playerOneDetails + "," + "WIN")
            radio.sendString("" + playerTwoDetails + "," + "LOSE")
            displayFinalWinner(1)
            basic.pause(5000)
        } else if (playerTwoScore > playerOneScore) {
            serial.writeLine("Final winner is Player Two! Resetting in 5 seconds...")
            radio.sendString("" + playerTwoDetails + "," + "WIN")
            radio.sendString("" + playerOneDetails + "," + "LOSE")
            displayFinalWinner(-1)
            basic.pause(5000)
        } else if (playerOneScore === playerTwoScore) {
            serial.writeLine("The game ends in a draw! Resetting in 5 seconds...")
            radio.sendString("" + playerOneDetails + "," + "DRAW")
            radio.sendString("" + playerTwoDetails + "," + "DRAW")
            displayFinalWinner(0)
            basic.pause(5000)
        }
        resetToNSS()
        playerOneScore = 0
        playerTwoScore = 0
        board = []
        state = 3
        serial.writeLine("Press A+B to start a new series.")
    }

})

input.onButtonPressed(Button.A, function () {
    if (state === 4) {
        state = 5 //Waiting for size input
        boardSize = 3
        basic.showNumber(boardSize)
        serial.writeLine("Please select size of game board. Press B when ready.")
    } else if (state === 5) {
        if (boardSize < 10) {
            boardSize += 1
        } else {
            boardSize = 3
        }
        if (boardSize === 10) {
            basic.showLeds(`
                # . # # #
                # . # . #
                # . # . #
                # . # . #
                # . # # #
                `)
        } else {
            basic.showNumber(boardSize)
        }
    }
})

input.onButtonPressed(Button.B, function () {
    if (state === 5) {
        state = 6 //Game started
        radio.sendString("" + playerOneDetails + "," + "RGR")
        radio.sendString("" + playerTwoDetails + "," + "RGR")
        radio.sendString("BS" + "," + boardSize)
        radio.sendString("BS" + "," + boardSize)
        serial.writeLine("Game commencing with board size = " + boardSize + ".")

        //Init Board
        serial.writeLine("")
        serial.writeLine("***GAME BOARD***")

        serial.writeLine("")

        board = []
        totalBoardSize = boardSize * boardSize
        printEmptyBoard(totalBoardSize)

        serial.writeLine("")

        playOrder = Math.randomRange(1, 2)
        if (playOrder === 1) {
            sendFirstMove(playerOneDetails) //Player One = Move 1/2 (First Move)
            sendSecondMove(playerTwoDetails) //Player Two = Move 2/2 (Second Move)
            serial.writeLine("Player One starts first. Press A to select cell, A+B to confirm.")
        } else {
            sendFirstMove(playerTwoDetails)
            sendSecondMove(playerOneDetails)
            serial.writeLine("Player Two starts first. Press A to select cell, A+B to confirm.")
        }
        basic.showIcon(IconNames.Happy)
    } else if (state === 6 || state === 7) {
        serial.writeLine("Game ended prematurely.")
        resetToNSS()
        serial.writeLine("Press A to begin new game.")
    }
})

function initHandshake() {
    state = 1 //Paired with Game Board (HyperTerminal)
    serial.writeLine("*** WELCOME TO TIC TAC TOE! ***")
    serial.writeLine("Waiting to pair with Player 1...")
}

function processWin(winner: number) {
    if (winner === 1) {
        serial.writeLine("Player One WIN! Resetting in 5 seconds...")
        radio.sendString("" + playerOneDetails + "," + "WIN")
        radio.sendString("" + playerTwoDetails + "," + "LOSE")
        playerOneScore += 12
        if (playerOneScore === 100) {
            playerOneScore = 0
        }
        display.bit(Math.floor(playerOneScore / 10), 0)
        display.bit(playerOneScore % 10, 1)
        basic.pause(5000)
        resetToNSS()
        serial.writeLine("Press A to begin new game.")
    } else if (winner === -1) {
        serial.writeLine("Player Two WIN! Resetting in 5 seconds...")
        radio.sendString("" + playerTwoDetails + "," + "WIN")
        radio.sendString("" + playerOneDetails + "," + "LOSE")
        playerTwoScore += 12
        if (playerTwoScore === 100) {
            playerTwoScore = 0
        }
        display.bit(Math.floor(playerTwoScore / 10), 0)
        display.bit(playerTwoScore % 10, 1)
        basic.pause(5000)
        resetToNSS()
        serial.writeLine("Press A to begin new game.")
    } else if (winner === 0) {
        serial.writeLine("The game ends in a draw! Resetting in 5 seconds...")
        radio.sendString("" + playerOneDetails + "," + "DRAW")
        radio.sendString("" + playerTwoDetails + "," + "DRAW")
        display.bit(playerOneScore / 10, 0)
        display.bit(playerOneScore % 10, 1)
        display.bit(playerTwoScore / 10, 2)
        display.bit(playerTwoScore % 10, 3)
        basic.pause(5000)
        resetToNSS()
        serial.writeLine("Press A to begin new game.")
    }
}

function resetToNSS() {
    radio.sendString("" + playerOneDetails + "," + "NSS")
    radio.sendString("" + playerTwoDetails + "," + "NSS")
    state = 4
    basic.showIcon(IconNames.Chessboard)
}

function displayFinalWinner(winValue: number) {
    if (winValue === 1) {
        display.bit(8, 0)
        display.bit(8, 1)
        display.bit(0, 2)
        display.bit(0, 3)
    } else if (winValue === -1) {
        display.bit(0, 0)
        display.bit(0, 1)
        display.bit(8, 2)
        display.bit(8, 3)
    } else if (winValue === 0) {
        display.bit(0, 0)
        display.bit(0, 1)
        display.bit(0, 2)
        display.bit(0, 3)
    }
}

function sendFirstMove(playerDetails: string) {
    radio.sendString("" + playerDetails + "," + "FM")
}

function sendSecondMove(playerDetails: string) {
    radio.sendString("" + playerDetails + "," + "SM")
}

function markBoard(xCoordString: string, yCoordString: string, deviceName: string) {
    xCoord = parseInt(xCoordString)
    yCoord = parseInt(yCoordString)
    boardIndexToMark = xCoord + (yCoord * boardSize)
    if (deviceName === playerOneDetails) {
        board[boardIndexToMark] = 1
    } else if (deviceName === playerTwoDetails) {
        board[boardIndexToMark] = -1
    }
}

function checkBoardOccupancy(xCoordString: string, yCoordString: string): boolean {
    xCoord = parseInt(xCoordString)
    yCoord = parseInt(yCoordString)
    boardIndexToMark = xCoord + (yCoord * boardSize)

    if (board[boardIndexToMark] === 0) {
        //music.playTone(Note.F, music.beat(BeatFraction.Quarter))
        return true
    } else {
        //music.playTone(Note.A, music.beat(BeatFraction.Half))
        return false
    }
    return true
}

function checkWin(xCoordString: string, yCoordString: string, deviceName: string): boolean {
    let requiredWinValue = 0
    xCoord = parseInt(xCoordString)
    yCoord = parseInt(yCoordString)

    if (deviceName === playerOneDetails) {
        requiredWinValue = 1
    } else if (deviceName === playerTwoDetails) {
        requiredWinValue = -1
    }

    if (checkRowWin(yCoord) === requiredWinValue) {
        processWin(requiredWinValue)
        return true
    }

    return false
}

function checkRowWin(yCoord: number): number {
    let win = 0
    boardIndexToCheckWin = yCoord * boardSize
    for (let i = 0; i < boardSize; i++) {
        if (win === 1) {
            if (board[boardIndexToCheckWin + i] === -1 || board[boardIndexToCheckWin + i] === 0) {
                return 0
            }
        } else if (win === -1) {
            if (board[boardIndexToCheckWin + i] === 1 || board[boardIndexToCheckWin + i] === 0) {
                return 0
            }
        } else if (board[boardIndexToCheckWin + i] === 0) {
            return 0
        } else if (board[boardIndexToCheckWin + i] === 1) {
            win = 1
        } else if (board[boardIndexToCheckWin + i] === -1) {
            win = -1
        }
    }
    return win
}

function checkColWin(xCoord: number, yCoord: number): boolean {
    return false
}

function checkDiagonalWin(xCoord: number, yCoord: number): boolean {
    return false
}

function checkAntiDiagonalWin(xCoord: number, yCoord: number): boolean {
    return false
}

function checkDraw(): boolean {
    for (let i = 0; i < boardSize; i++) {
        if (board[i] === 0) {
            return false
        }
    }
    return true
}

function printEmptyBoard(totalBoardSize: number) {
    for (let i = 0; i < totalBoardSize; i++) {
        board[i] = 0
        if (i % boardSize === 0) {
            if (board[i] === 0) {
                serial.writeString("| _ |")
            }
        } else if (i % boardSize <= boardSize - 2) {
            serial.writeString(" _ |")
        } else if (i % boardSize === boardSize - 1) {
            serial.writeLine(" _ |")
        }
    }
}

function printCurrentBoard() {

    serial.writeLine("")
    serial.writeLine("***GAME BOARD***")
    serial.writeLine("")

    for (let i = 0; i < board.length; i++) {
        if (i % boardSize === 0) {
            if (board[i] === 0) {
                serial.writeString("| _ |")
            } else if (board[i] === 1) {
                serial.writeString("| X |")
            } else if (board[i] === -1) {
                serial.writeString("| O |")
            }
        } else if (i % boardSize <= boardSize - 2) {
            if (board[i] === 0) {
                serial.writeString(" _ |")
            } else if (board[i] === 1) {
                serial.writeString(" X |")
            } else if (board[i] === -1) {
                serial.writeString(" O |")
            }
        } else if (i % boardSize === boardSize - 1) {
            if (board[i] === 0) {
                serial.writeLine(" _ |")
            } else if (board[i] === 1) {
                serial.writeLine(" X |")
            } else if (board[i] === -1) {
                serial.writeLine(" O |")
            }
        }
    }

    serial.writeLine("")
}

basic.showIcon(IconNames.Yes)
basic.forever(() => {
})
