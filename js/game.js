'use strict'

var gBoard = [];
var idInterval = 0;

const MINE = '💣';
const FLAG = '🏳';
const LIVE = '❤';
const GAME_START = '😃';
const STEPPED_ON_MINE = '👎';
const GAME_WIN = '😎';
const HINT = '💡  ';

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    livesCount: 3,
    hintsNum: 3,
    hintMood: false,
    safeClicksNum: 3,
    lastMove: 0
};

var gLevel = {
    size: 12,
    mine: 30
};

function initGame() {
    clearInterval(idInterval);
    initGgame();
    initDom();
    setMinesNumAccordingToBoardSize(gLevel.size);
    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard, '.board-container');
}

function initGgame() {
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.livesCount = 3;
    gGame.hintsNum = 3;
    gGame.safeClicksNum = 3;
    gGame.lastMove = 0;
    gGame.isOn = false;
    gGame.secsPassed = 0;
}

function initDom() {
    var elMsg = document.querySelector('.count-safe-click');
    elMsg.innerText = `You have ${gGame.safeClicksNum} more clicks`;
    elMsg.style.visibility = 'visible';
    document.querySelector('.time span').innerText = gGame.secsPassed;
    document.querySelector('.safe-click').style.visibility = 'visible';
    document.querySelector('.smiley').innerText = GAME_START;
    document.querySelector('h2 span').innerText = LIVE.repeat(gGame.livesCount);
    document.querySelector('.hints').innerText = HINT.repeat(gGame.hintsNum);
}

function setMinesNumAccordingToBoardSize(boardSize) {
    gLevel.mine = 2;
    if (boardSize === 8) gLevel.mine = 12;
    else if (boardSize === 12) gLevel.mine = 30;
}

function buildBoard(boardSize) {
    var board = [];
    for (var i = 0; i < boardSize; i++) {
        board[i] = [];
        for (var j = 0; j < boardSize; j++) {
            board[i][j] = createCell();
        }
    }
    setMinesOnBoard(boardSize, board);
    return board;
}

function createCell() {
    var cell = {
        mineAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    };
    return cell;
}

function setMinesOnBoard(boardSize, board) {
    var minesNum = 2;
    if (boardSize === 8) minesNum = 12;
    if (boardSize === 12) minesNum = 30;

    var i = getRandomNum(boardSize, 0);
    var j = getRandomNum(boardSize, 0);
    var cell = board[i][j];

    for (var counter = 0; counter < minesNum; counter++) {
        while (cell.isMine) {
            i = getRandomNum(boardSize, 0);
            j = getRandomNum(boardSize, 0);
            cell = board[i][j];
        }
        cell.isMine = true;
        setMinesNegsCount(board, i, j);
    }
}

function setMinesNegsCount(board, iIdx, jIdx) {
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j > board.length - 1) continue;
            if (i === iIdx && j === jIdx) continue;
            var cell = board[i][j];
            ++cell.mineAroundCount;
        }
    }
}

function cellClicked(elCell, ev) {
    const RIGHT_CLICK = 2;
    var cellIndex = getCellIndex(elCell.id);
    var cell = gBoard[cellIndex.i][cellIndex.j];
    document.addEventListener('contextmenu', event => event.preventDefault());

    if (cell.isMine && !gGame.isOn) return initGame();
    if (!gGame.isOn) idInterval = setInterval(SetTime, 1000);
    gGame.isOn = true;
    if (gGame.lastMove === cellIndex && !cell.isMarked) return;
    if (gGame.hintMood) return shownNeighborsForSec(cellIndex);
    if (ev.button === RIGHT_CLICK) {
        toggleFlag(cell, elCell);
    } else if (cell.isMarked) {
        return;
    } else if (cell.mineAroundCount === 0) {
        recursiveExpandShown(cellIndex);
    } else if (cell.isMine) {
        if (gGame.livesCount) --gGame.livesCount;
        var elLives = document.querySelector('h2 span');
        elLives.innerText = (!gGame.livesCount) ? '0' : LIVE.repeat(gGame.livesCount);
        document.querySelector('.smiley').innerText = STEPPED_ON_MINE;
        elCell.innerText = cell.mineAroundCount;
    } else {
        document.querySelector('.smiley').innerText = GAME_START;
        elCell.innerText = cell.mineAroundCount;
        cell.isMarked = false;
    }

    gGame.lastMove = cellIndex;
    cell.isShown = true;
    upDateCounts();
    checkIfGameOver();
}

function upDateCounts() {
    var shownCount = 0;
    var markedCount = 0;
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var cell = gBoard[i][j];
            if (cell.isShown) ++shownCount;
            if (cell.isMarked) ++markedCount;
        }
    }
    gGame.shownCount = shownCount;
    gGame.markedCount = markedCount;
}

function checkIfGameOver() {
    var elSmiley = document.querySelector('.smiley');
    if (!gGame.livesCount) {
        elSmiley.innerText = STEPPED_ON_MINE;
        revealedAllMines();
        clearInterval(idInterval);
        return;
    }
    if (gGame.shownCount !== gLevel.size ** 2) return;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isMine && cell.isMarked) return;
        }
    }
    gGame.isOn = false;
    elSmiley.innerText = GAME_WIN;
    clearInterval(idInterval);
}

function revealedAllMines() {
    var mines = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine && !cell.isShown) {
                var mineIndex = { i: i, j: j };
                mines.push(mineIndex);
            }
        }
    }
    updateModel(mines);
    renderCells(mines);
}

function toggleFlag(cell, elCell) {
    if (cell.isMarked) {
        cell.isMarked = false;
        elCell.innerText = '';
        elCell.classList.remove('flag');
    } else {
        cell.isMarked = true;
        elCell.innerText = FLAG;
        elCell.classList.add('flag');
    }
}

function getHint() {
    if (!gGame.hintsNum) return;
    --gGame.hintsNum;
    document.querySelector('.hints').innerText = HINT.repeat(gGame.hintsNum);
    gGame.hintMood = true;
}

function shownNeighborsForSec(cellIndex) {
    var neighbors = findNeighbors(cellIndex.i, cellIndex.j);
    renderCells(neighbors);
    var neighborsWithZero = findNeighborsWithCountMineZero(cellIndex.i, cellIndex.j);
    for (var i = 0; i < neighborsWithZero.length; i++){
        renderCellsWithZeroMine(neighborsWithZero[i]);
    }
    setTimeout(unShownNeighbors, 1000, neighbors, neighborsWithZero);
}

function unShownNeighbors(cells, zeroCells) {
    gGame.hintMood = false;
    for (var i = 0; i < cells.length; i++) {
        var elCell = document.querySelector(`#cell-${cells[i].i}-${cells[i].j}`);
        elCell.innerText = '';
    }
    for (var i = 0; i < zeroCells.length; i++){
        var elCell = document.querySelector(`#cell-${zeroCells[i].i}-${zeroCells[i].j}`);
        elCell.style.backgroundColor = 'rgb(250, 250, 250)';
    }
}

function recursiveExpandShown(cellIndex) {
    updateModelforOneCell(cellIndex);
    renderCellsWithZeroMine(cellIndex);
    var neighbors = findNeighbors(cellIndex.i, cellIndex.j);
    updateModel(neighbors);
    renderCells(neighbors);

    var neighborsWithZero = findNeighborsWithCountMineZero(cellIndex.i, cellIndex.j);
    if (!neighborsWithZero.length) return;
    for (var i = 0; i < neighborsWithZero.length; i++) {
        recursiveExpandShown(neighborsWithZero[i]);
    }
}

function updateModel(cells) {
    for (var i = 0; i < cells.length; i++) {
        var cell = gBoard[cells[i].i][cells[i].j];
        cell.isShown = true;
    }
}

function renderCells(cells) {
    for (var i = 0; i < cells.length; i++) {
        var elCell = document.querySelector(`#cell-${cells[i].i}-${cells[i].j}`);
        var cell = gBoard[cells[i].i][cells[i].j];
        elCell.innerText = cell.mineAroundCount;
    }
}

function updateModelforOneCell(cell) {
    var cell = gBoard[cell.i][cell.j];
    cell.isShown = true;
}

function renderCellsWithZeroMine(cell) {
    var elCell = document.querySelector(`#cell-${cell.i}-${cell.j}`);
    elCell.style.backgroundColor = 'lightgray';
}

function safeClicks(elBtn) {
    --gGame.safeClicksNum;
    if (gGame.safeClicksNum < 0) return;

    var elMsgSpan = document.querySelector('.count-safe-click');
    elMsgSpan.innerText = `You have ${gGame.safeClicksNum} more clicks`;

    var safeCells = findSafeCells(gBoard);
    var randNum = getRandomNum(safeCells.length, 0);
    var safeCell = safeCells[randNum];

    var elCell = document.querySelector(`#cell-${safeCell.i}-${safeCell.j}`);
    elCell.innerText = gBoard[safeCell.i][safeCell.j].mineAroundCount;

    setTimeout(unShownsafeClick, 1000, elCell);

    if (gGame.safeClicksNum === 0) {
        elBtn.style.visibility = 'hidden';
        elMsgSpan.style.visibility = 'hidden';
    }
}

function unShownsafeClick(elCell) {
    elCell.innerText = '';
}

function undo() {
    if (!gGame.lastMove) return;
    var undoIndex = gGame.lastMove;
    gBoard[undoIndex.i][undoIndex.j].isShown = false;
    if (gBoard[undoIndex.i][undoIndex.j].isMine) {
        gGame.livesCount++;
        document.querySelector('h2 span').innerText = LIVE.repeat(gGame.livesCount);
    }
    var elCell = document.querySelector(`#cell-${undoIndex.i}-${undoIndex.j}`);
    elCell.innerText = '';
    upDateCounts();
}

function changeLevel(elBtn) {
    if (elBtn.classList.contains('eazy-level')) gLevel.size = 4;
    else if (elBtn.classList.contains('hurd-level')) gLevel.size = 8;
    else gLevel.size = 12;
    initGame();
}

