'use strict'

var gBoard = [];
var gSecCounter = 0;
var idInterval = 0;

const MINE = '💣';
const FLAG = '🏳';
const LIVE = '❤';
const GAME_START = '😃';
const STEPPED_ON_MINE = '👎';
const GAME_WIN = '😎';
const HINT = '💡  '

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    livesCount: 3,
    hintsNum: 3,
    hintMood: false,
    safeClicksNum: 3
};

var gLevel = {
    size: 4,
    mine: 2
};

function initGame() {
    clearInterval(idInterval);
    gGame.shownCount = gGame.markedCount = 0;
    gGame.livesCount = 3;
    gGame.hintsNum = 3;
    gGame.safeClicksNum = 3;
    document.querySelector('.safe-click').style.visibility ='visible';
    setMinesNumAccordingToBoardSize(gLevel.size);
    gBoard = buildBoard(gLevel.size);
    document.querySelector('.smiley').innerText = GAME_START;
    document.querySelector('h2 span').innerText = LIVE.repeat(gGame.livesCount);
    document.querySelector('.hints').innerText = HINT.repeat(gGame.hintsNum);
    printMat(gBoard, '.board-container');
    gSecCounter = 0;
    idInterval = setInterval(SetTime, 1000);
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
    return board
}

function createCell() {
    var cell = {
        mineAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
    };
    return cell;
}

function setMinesOnBoard(boardSize, board) {
    var minesNum = 2;
    if (boardSize === 8) minesNum = 12;
    if (boardSize === 12) minesNum = 30;

    var i = getRandomNum(boardSize, 0);
    var j = getRandomNum(boardSize, 0)
    var cell = board[i][j]

    for (var counter = 0; counter < minesNum; counter++) {
        while (cell.isMine) {
            i = getRandomNum(boardSize, 0);
            j = getRandomNum(boardSize, 0);
            cell = board[i][j]
        }
        cell.isMine = true;
        setMinesNegsCount(board, i, j);
    }
}

function setMinesNegsCount(board, iIdx, jIdx) {
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j > board.length - 1) continue
            if (i === iIdx && j === jIdx) continue
            var cell = board[i][j];
            ++cell.mineAroundCount;
        }
    }
}

function setMinesNumAccordingToBoardSize(boardSize) {
    gLevel.mine = 2;
    if (boardSize === 8) gLevel.mine = 12;
    else if (boardSize === 12) gLevel.mine = 30;
}

function cellClicked(elCell, ev) {
    const RIGHT_CLICK = 2;
    var cellIndex = getCellIndex(elCell.id);
    var cell = gBoard[cellIndex.i][cellIndex.j];
    gGame.isOn = true;

    if (cell.isMine && !gGame.isOn) return initGame();
    if (gGame.hintMood) return shownNeighborsForSec(cellIndex);
    if (ev.button === RIGHT_CLICK) {
        cell.isMarked = true;
        elCell.innerText = FLAG;
    } else if (cell.mineAroundCount === 0) {
        recursiveExpandShown(cellIndex);
    } else if (cell.isMine && !cell.isMarked) {
        gGame.livesCount = (!gGame.livesCount) ? 0 : --gGame.livesCount;
        var elLives = document.querySelector('h2 span');
        elLives.innerText = (!gGame.livesCount) ? '0' : LIVE.repeat(gGame.livesCount);
        document.querySelector('.smiley').innerText = STEPPED_ON_MINE;
        elCell.innerText = cell.mineAroundCount;
    } else {
        document.querySelector('.smiley').innerText = GAME_START;
        elCell.innerText = cell.mineAroundCount;
        cell.isMarked = false;
    }

    cell.isShown = true;
    upDateCounts();
    checkIfGameOver();
}

function checkIfGameOver() {
    var elSmiley = document.querySelector('.smiley');
    if (!gGame.livesCount) {
        elSmiley.innerText = STEPPED_ON_MINE;
        clearInterval(idInterval);
        return;
    }
    if (gGame.shownCount !== gLevel.size ** 2) return
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var cell = gBoard[i][j];
            if (!cell.isMine && cell.isMarked) return;
        }
    }
    gGame.isOn = false;
    elSmiley.innerText = GAME_WIN;
    clearInterval(idInterval);
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

function getHint() {
    if (gGame.hintsNum <= 0) return;
    --gGame.hintsNum
    document.querySelector('.hints').innerText = HINT.repeat(gGame.hintsNum);
    gGame.hintMood = true;
}

function shownNeighborsForSec(cellIndex) {
    var neighbors = findNeighbors(cellIndex.i, cellIndex.j);
    renderCells(neighbors);
    setTimeout(unShownNeighbors, 1000, neighbors);
}

function unShownNeighbors(cells) {
    gGame.hintMood = false;
    for (var i = 0; i < cells.length; i++) {
        var elCell = document.querySelector(`#cell-${cells[i].i}-${cells[i].j}`);
        elCell.innerText = '';
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

function changeLevel(elBtn) {
    if (elBtn.classList.contains('eazy-level')) gLevel.size = 4;
    else if (elBtn.classList.contains('hurd-level')) gLevel.size = 8;
    else gLevel.size = 12;
    initGame();
}

function safeClicks(elBtn) {
    --gGame.safeClicksNum;
    if (gGame.safeClicksNum < 0) return;
    var safeCells = findSafeCells(gBoard);
    var randNum = getRandomNum(safeCells.length, 0);
    var safeCell = safeCells[randNum];
    var elCell = document.querySelector(`#cell-${safeCell.i}-${safeCell.j}`);
    elCell.innerText = gBoard[safeCell.i][safeCell.j].mineAroundCount;
    setTimeout(unShownsafeClick, 1000, elCell);
    if (gGame.safeClicksNum === 0) elBtn.style.visibility = 'hidden';
}

function unShownsafeClick(elCell) {
    elCell.innerText = '';
}
