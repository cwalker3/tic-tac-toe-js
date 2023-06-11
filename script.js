const gameController = (() => {
  let players;
  let currentPlayer;

  const start = (nameOne, nameTwo, mode) => {
    displayController.setUpBoard();
    gameBoard.clearBoard();
    players = _getPlayers(nameOne, nameTwo, mode);
    displayController.updateScore(players[0], players[1]);
    currentPlayer = _randomPlayer();
    currentSymbol = 'X';
    displayController.updateTurn(currentPlayer);
    _play();
  };

  const _getPlayers = (nameOne, nameTwo, mode) => {
    let playerOne = playerFactory(nameOne);
    let playerTwo;
    if (mode == 'player') {
      playerTwo = playerFactory(nameTwo);
    } else {
      playerTwo = computerFactory(mode);
    }
    return [playerOne, playerTwo];
  };

  const _randomPlayer = () => {
    let rand = Math.floor(Math.random() * 2);
    return players[rand];
  };

  const choose = (choice) => {
    let position;
    if (choice instanceof Event) {
      position = choice.target.dataset.position;
    } else {
      position = choice;
    }
    gameBoard.update(position, currentSymbol);
    displayController.updateBoard(position, currentSymbol);
    if (gameBoard.isWin(currentSymbol)) {
      _gameOver();
    } else if (gameBoard.isFull()) {
      _tieGame();
    } else {
      _nextTurn();
    }
  };

  const _tieGame = () => {
    displayController.tieGame();
    gameBoard.clearBoard();
    currentSymbol = 'X';
  };

  const _gameOver = () => {
    currentPlayer.win();
    displayController.updateScore(players[0], players[1]);
    displayController.playerWin(currentPlayer);
    gameBoard.clearBoard();
    currentSymbol = 'X';
  };

  const _nextTurn = () => {
    currentPlayer = _nextPlayer();
    currentSymbol = _nextSymbol();
    displayController.updateTurn(currentPlayer);
    _play();
  };

  const _nextPlayer = () => {
    if (currentPlayer == players[0]) {
      return players[1];
    } else {
      return players[0];
    }
  };

  const _nextSymbol = () => {
    if (currentSymbol == 'X') {
      return 'O';
    } else {
      return 'X';
    }
  };

  const restart = () => {
    displayController.setUpBoard();
    currentSymbol = 'X';
    currentPlayer = _nextPlayer();
    displayController.updateTurn(currentPlayer);
    _play();
  };

  const _play = () => {
    if (currentPlayer.hasOwnProperty('chooseMove')) {
      displayController.disableSelectables();
      setTimeout(function () {
        currentPlayer.chooseMove();
        displayController.enableSelectables();
      }, 1000);
    }
  };

  return { start, choose, restart };
})();

const gameBoard = (() => {
  let board = ['', '', '', '', '', '', '', '', ''];

  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const clearBoard = function () {
    this.board = ['', '', '', '', '', '', '', '', ''];
  };

  const update = function (position, symbol) {
    this.board[position] = symbol;
  };

  const isWin = function (symbol) {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        this.board[a] == symbol &&
        this.board[b] == symbol &&
        this.board[c] == symbol
      ) {
        return true;
      }
    }
  };

  const isFull = function () {
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] == '') {
        return false;
      }
    }
    return true;
  };

  const emptyPositions = function () {
    let positions = [];
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] == '') {
        positions.push(i);
      }
    }
    return positions;
  };

  return { clearBoard, update, isWin, isFull, emptyPositions, board };
})();

const playerFactory = (name) => {
  let score = 0;

  const win = function () {
    this.score++;
  };

  return { name, score, win };
};

const computerFactory = (mode) => {
  let score = 0;

  const win = function () {
    this.score++;
  };

  const name = `Computer(${mode})`;

  const chooseMove = () => {
    if (mode == 'easy') {
      _randomMove();
    } else if (mode == 'medium') {
      _goodMove();
    } else {
      _bestMove();
    }
  };

  const _randomMove = () => {
    let positions = gameBoard.emptyPositions();
    let rand = Math.floor(Math.random() * positions.length);
    let position = positions[rand];
    gameController.choose(position);
  };

  const _goodMove = () => {};

  return { name, score, win, chooseMove };
};

const displayController = (() => {
  const modeInput = document.querySelector('#mode');
  const playerOneInput = document.querySelector('#player-one-name');
  const playerTwoInput = document.querySelector('#player-two-name');
  const startButton = document.querySelector('.start');
  const playerOneScore = document.querySelector('.player1-score');
  const playerTwoScore = document.querySelector('.player2-score');
  const message = document.querySelector('.message');
  const rematch = document.querySelector('.rematch');
  const newGame = document.querySelector('.new');
  const optionsContainer = document.querySelector(
    '.game-options-container'
  );
  const gameOverContainer = document.querySelector(
    '.game-over-container'
  );
  const gameOverMessage = document.querySelector(
    '.game-over-message'
  );

  const _updatePlayerTwoInput = () => {
    if (modeInput.value == 'player') {
      playerTwoInput.disabled = false;
      playerTwoInput.value = '';
      playerTwoInput.placeholder = 'Player 2';
    } else if (modeInput.value == 'easy') {
      playerTwoInput.disabled = true;
      playerTwoInput.value = 'Computer(easy)';
    } else {
      playerTwoInput.disabled = true;
      playerTwoInput.value = 'Computer(hard)';
    }
  };

  modeInput.addEventListener('change', _updatePlayerTwoInput);

  const _setUpSquare = (square) => {
    square.children[0].innerHTML = '';
    square.children[0].style.transform =
      'translate(-50%, -50%) scale(0)';
    square.classList.add('selectable');
    square.removeEventListener('click', gameController.choose);
    square.addEventListener('click', gameController.choose);
  };

  const setUpBoard = () => {
    const squares = document.querySelectorAll('.board-square');
    squares.forEach((square) => _setUpSquare(square));
  };

  startButton.addEventListener('click', function () {
    optionsContainer.classList.add('hidden');
    gameController.start(
      playerOneInput.value,
      playerTwoInput.value,
      mode.value
    );
  });

  const updateScore = (playerOne, playerTwo) => {
    playerOneScore.innerHTML = `${playerOne.name}: ${playerOne.score}`;
    playerTwoScore.innerHTML = `${playerTwo.name}: ${playerTwo.score}`;
  };

  const updateTurn = (player) => {
    message.innerHTML = `${player.name}'s Turn`;
  };

  const updateBoard = (position, symbol) => {
    square = document.querySelector(
      `div[data-position='${position}']`
    );
    square.children[0].innerHTML = symbol;
    square.children[0].style.transform =
      'translate(-50%, -50%) scale(1)';
    square.removeEventListener('click', gameController.choose);
    square.classList.remove('selectable');
  };

  const playerWin = (player) => {
    gameOverMessage.innerHTML = `${player.name} wins!`;
    gameOverContainer.classList.remove('hidden');
  };

  const tieGame = () => {
    gameOverMessage.innerHTML = `Tie game`;
    gameOverContainer.classList.remove('hidden');
  };

  rematch.addEventListener('click', () => {
    gameOverContainer.classList.add('hidden');
    gameController.restart();
  });

  newGame.addEventListener('click', () => {
    gameOverContainer.classList.add('hidden');
    optionsContainer.classList.remove('hidden');
  });

  const disableSelectables = () => {
    const selectables = document.querySelectorAll('.selectable');
    selectables.forEach((selectable) => {
      selectable.classList.remove('selectable');
      selectable.removeEventListener('click', gameController.choose);
    });
  };

  const enableSelectables = () => {
    const squares = document.querySelectorAll('.board-square');
    squares.forEach((square) => {
      if (square.children[0].innerHTML == '') {
        square.classList.add('selectable');
        square.addEventListener('click', gameController.choose);
      }
    });
  };

  return {
    modeInput,
    playerOneInput,
    playerTwoInput,
    setUpBoard,
    updateScore,
    updateTurn,
    updateBoard,
    playerWin,
    tieGame,
    disableSelectables,
    enableSelectables,
  };
})();
