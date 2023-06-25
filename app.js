const gameBoard = ((numberOfRows, numberOfCols) => {
    let boardState = [];

    const buildBoard = () => {
        for (let i = 0; i < numberOfRows; i++) {
            const row = [];
            for (let j = 0; j < numberOfCols; j++) {
                row.push("");
            }
            boardState.push(row);
        }
    };

    buildBoard();

    const resetBoard = () => {
        boardState = [];
        buildBoard();
    };

    const getBoardState = () => boardState;

    const isCellAvailable = (row, column) => {
        if (boardState[row][column] === "") {
            return true;
        }
        return false;
    };

    const addMarkerToBoard = (marker, row, column) => {
        if (isCellAvailable(row, column)) {
            boardState[row][column] = marker;
            return true;
        }
        return false;
    };

    return { getBoardState, addMarkerToBoard, resetBoard };
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

    const setFirstPlayerToPlay = () => {
        const players = [player1, player2];
        const playerIndex = Math.floor(Math.random() * players.length);
        currentPlayer = players[playerIndex];
    };

    setFirstPlayerToPlay();

    const togglePlayerTurn = () => {
        if (currentPlayer === player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }
    };

    const getCurrentPlayer = () => {
        return currentPlayer;
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
        if (isGameOver) return { success: false, msg: "Game is already over" };
        const successfulPlacement = gameBoard.addMarkerToBoard(currentPlayer.getMarker(), rowPosition, colPosition);
        if (!successfulPlacement) return { success: false, msg: "This cell is already taken" };
        if (isThereAWinner()) {
            isGameOver = true;
            return { success: true, msg: `${currentPlayer.getName()} won!!` };
        }
        turns++;
        if (turns === 9) {
            isGameOver = true;
            return { success: true, msg: "Draw!!" };
        }
        togglePlayerTurn();
        return  { success: true }
    };

    const resetGame = () => {
        gameBoard.resetBoard();
        turns = 0;
        isGameOver = false;
        setFirstPlayerToPlay();
    };

    return { playRound, getCurrentPlayer, resetGame };
})(player1, player2, gameBoard);


const displayController = (() => {
    const cellButtons = document.querySelectorAll(".cell");
    const resetGameBtn = document.querySelector(".reset-btn");

    const catIcon = document.querySelector(".cat");
    const dogIcon = document.querySelector(".dog");

    const fillCell = (event) => {
        console.log(event.target);
        // event bubbling and capturing to the svg icons >:(
        if (event.target.className !== "cell") return;
        const cellRow = Number(event.target.getAttribute("data-row"));
        const cellColumn = Number(event.target.getAttribute("data-column"));
        const currentPlayer = game.getCurrentPlayer();
        console.log({ target: event.target} );
        const { success, msg } = game.playRound(cellRow, cellColumn);
         if (success) {
            if (currentPlayer.getMarker() === "X") {
                event.target.appendChild(catIcon.cloneNode(true));
            } else {
                event.target.appendChild(dogIcon.cloneNode(true));
            }
            // event.target.textContent = currentPlayer.getMarker();
        } 
        console.log(msg);
    };
    
    cellButtons.forEach(cellButton => {
        cellButton.addEventListener("click", fillCell, true);
    });

    resetGameBtn.addEventListener("click", (event) => {
        game.resetGame();
        cellButtons.forEach(cellButton => {
            cellButton.textContent = "";
        });
    });
})();
