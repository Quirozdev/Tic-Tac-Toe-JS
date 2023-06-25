const gameBoard = ((numberOfRows, numberOfCols) => {
    const boardState = [];

    for (let i = 0; i < numberOfRows; i++) {
        const row = [];
        for (let j = 0; j < numberOfCols; j++) {
            row.push("");
        }
        boardState.push(row);
    }

    const getBoardState = () => boardState;

    const addMarkerToBoard = (marker, row, column) => {
        if (boardState[row][column] === "") {
            boardState[row][column] = marker;
            return true;
        }
        return false;
    };

    return { getBoardState, addMarkerToBoard };
})(3, 3);


const Player = (name, marker) => {
    const getName = () => name;
    const getMarker = () => marker;

    return { getName, getMarker };
};

const player1 = Player("Luis", "X");
const player2 = Player("Daniel", "O");


const game = ((player1, player2, gameBoard) => {
    let turns = 0;
    let isGameOver = false;
    let currentPlayer; 

    const setFirstPlayerToPlay = (() => {
        const players = [player1, player2];
        const playerIndex = Math.floor(Math.random() * players.length);
        currentPlayer = players[playerIndex];
    })();

    const togglePlayerTurn = () => {
        if (currentPlayer === player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }
    };

    const getCurrentTurn = () => {
        return `It's ${currentPlayer.getName()} turn!`;
    };

    const isWin = (cellsLine, marker) => {
        for (let i = 0; i < cellsLine.length; i++) {
            if (cellsLine[i] !== marker) {
                return false;
            }
        }
        return true;
    };

    const isThereAWinner = () => {
        const marker = currentPlayer.getMarker();
        const currentBoardState = gameBoard.getBoardState();
        const diagonal = [];
        const invertedDiagonal = [];
        for (let i = 0; i < currentBoardState.length; i++) {
            const currentRow = [];
            const currentColumn = [];
            
            diagonal.push(currentBoardState[i][i]);

            invertedDiagonal.push(currentBoardState[currentBoardState.length - 1 - i][i]);

            for (let j = 0; j < currentBoardState[i].length; j++) {
                currentRow.push(currentBoardState[i][j]);
                currentColumn.push(currentBoardState[j][i]);
            }

            if (isWin(currentRow, marker)) {
                return true;
            }

            if (isWin(currentColumn, marker)) {
                return true;
            };
        }
        // check diagonals
        if (isWin(diagonal, marker)) {
            return true;
        };

        if (isWin(invertedDiagonal, marker)) {
            return true;
        };

        return false;
    };

    const playRound = (rowPosition, colPosition) => {
        if (isGameOver) return;
        console.log(getCurrentTurn());
        const successfulPlacement = gameBoard.addMarkerToBoard(currentPlayer.getMarker(), rowPosition, colPosition);
        console.log(gameBoard.getBoardState());
        if (!successfulPlacement) return;
        if (isThereAWinner()) {
            isGameOver = true;
            return `${currentPlayer.getName()} won!!`;
        }
        turns++;
        if (turns === 8) {
            isGameOver = true;
            return "Draw!";
        }
        togglePlayerTurn();
    };

    return { playRound };
})(player1, player2, gameBoard);


game.playRound(0, 1);
game.playRound(1, 2);
game.playRound(0, 0);
game.playRound(1, 0);
game.playRound(2, 0);
game.playRound(1, 1);
