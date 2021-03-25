'use strict'

function findNeighborsWithCountMineZero(iIdx, jIdx) {
    var indx = -1;
    var neighborsWithCountZero = [];
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue
            if (i === iIdx && j === jIdx) continue
            var cell = gBoard[i][j];
            if (cell.mineAroundCount === 0 && !cell.isShown) {
                indx = { i: i, j: j };
                neighborsWithCountZero.push(indx);

            }
        }
    }
    return neighborsWithCountZero;;
}

function findNeighbors(iIdx, jIdx) {
    var indx = -1;
    var neighbors = []
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue
            if (i === iIdx && j === jIdx) continue
            var cell = gBoard[i][j];
            if (cell.mineAroundCount > 0 && !cell.isShown
                || cell.mineAroundCount === MINE) {
                indx = { i: i, j: j };
                neighbors.push(indx);
            }
        }
    }
    return neighbors;
}

function findSafeCells(board) {
    var safeCells = [];
    var cellIndex = { i: -1, j: -1 };
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            if (!cell.isShown && !cell.isMine && cell.mineAroundCount) {
                cellIndex.i = i;
                cellIndex.j = j;
                safeCells.push(cellIndex);
            }
        }
    }
    return safeCells;
}

function getRandomNum(max, min) {
    return Math.floor(Math.random() * (max - min) + min);
}

function SetTime() {
    var elTime = document.querySelector('.time span');
    elTime.innerText = gGame.secsPassed;
    gGame.secsPassed++;
}

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = `cell mines-count${cell.mineAroundCount}`;
            var tdId = `cell-${i}-${j}`;
            if (cell.isMine) {
                cell.mineAroundCount = cell = MINE;
                className = `cell mine`;
            } else cell = '';
            strHTML += `<td id= "${tdId}" class="${className}"
                                   onmousedown="cellClicked(this, event)"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function getCellIndex(strCellId) {
    var parts = strCellId.split('-')
    var index = { i: +parts[1], j: +parts[2] };
    return index;
}
