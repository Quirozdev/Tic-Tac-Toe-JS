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
    const setName = (newName) => name = newName;
    const getMarker = () => marker;

    return { getName, setName, getMarker };
};

const game = ((gameBoard) => {
    let turns = 0;
    let isGameOver = false;

    let player1;
    let player2;

    let currentPlayer; 

    const setFirstPlayerToPlay = () => {
        const players = [player1, player2];
        const playerIndex = Math.floor(Math.random() * players.length);
        currentPlayer = players[playerIndex];
    };

    const initPlayers = (player1Name, player2Name) => {
        player1 = Player(player1Name, "X");
        player2 = Player(player2Name, "O");
        setFirstPlayerToPlay();
    };

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
            return { success: true, winner: currentPlayer, draw: false };
        }
        turns++;
        if (turns === 9) {
            isGameOver = true;
            return { success: true, draw: true };
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

    return { initPlayers, playRound, getCurrentPlayer, resetGame };
})(gameBoard);


const displayController = (() => {

    const gameStartForm = document.querySelector("#game-start-form");

    const mainGame = document.querySelector(".main");

    const displayStart = () => {
        const currentPlayer = game.getCurrentPlayer();
        playerTurnElement.textContent = `It's ${currentPlayer.getName()} turn!`;
    };

    gameStartForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const firstPlayerName = formData.get("player-1-name");
        const secondPlayerName = formData.get("player-2-name");
        game.initPlayers(firstPlayerName, secondPlayerName);
        gameStartForm.classList.add("hidden");
        mainGame.classList.remove("hidden");
        displayStart();
    });

    const cellButtons = document.querySelectorAll(".cell");
    
    const playerTurnElement = document.querySelector(".player-turn");
    const errorMsgElement = document.querySelector(".error-message");
    const winnerElement = document.querySelector(".winner");
    const resetGameBtn = document.querySelector(".reset-btn");

    const catIcon = document.querySelector(".cat");
    const dogIcon = document.querySelector(".dog");

    const putCorrespondingIcon = (marker, cellBtn) => {
        if (marker === "X") {
            cellBtn.appendChild(catIcon.cloneNode(true));
        } else {
            cellBtn.appendChild(dogIcon.cloneNode(true));
        }
    };

    const fillCell = (event) => {
        // event bubbling and capturing to the svg icons >:(
        // the svg are childs of the cell buttons, so whe a cell button is clicked,
        // is possible that instead of the button being the event.target, its the svg icons
        // with this check, its making sure that the button cell its going to be the event.target
        const cellBtn = event.target.className === "cell" ? event.target : event.target.closest(".cell");
        const cellRow = Number(cellBtn.getAttribute("data-row"));
        const cellColumn = Number(cellBtn.getAttribute("data-column"));
        const currentPlayer = game.getCurrentPlayer();
        const { success, msg, winner, draw } = game.playRound(cellRow, cellColumn);
        if (!success) {
            errorMsgElement.textContent = msg;
            return;
        }
        // clear error msg if there is any
        errorMsgElement.textContent = "";
        putCorrespondingIcon(currentPlayer.getMarker(), cellBtn);
        if (!winner && !draw) {
            // post player after the current player played
            playerTurnElement.textContent = `It's ${game.getCurrentPlayer().getName()} turn!`;
            return;
        }

        if (draw) {
            winnerElement.textContent = `Draw!`;
        } else {
            // if there is a winner
            winnerElement.textContent = `${winner.getName()} won!`;
        }
        playerTurnElement.textContent = "";
        errorMsgElement.textContent = "";
    };
    
    cellButtons.forEach(cellButton => {
        cellButton.addEventListener("click", fillCell, true);
    });

    resetGameBtn.addEventListener("click", (event) => {
        game.resetGame();
        cellButtons.forEach(cellButton => {
            cellButton.textContent = "";
        });
        playerTurnElement.textContent = `It's ${game.getCurrentPlayer().getName()} turn!`;
        errorMsgElement.textContent = "";
        winnerElement.textContent = "----";
    });
})();
