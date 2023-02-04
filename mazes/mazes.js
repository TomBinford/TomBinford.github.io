const $ = id => document.getElementById(id);

const nRowRange = [3, 20];
const nColRange = nRowRange;
const initialNRows = 10;
const initialNCols = 10;

const WALL_CHAR = 'X';
const OPEN_CHAR = '.';
const NO_CHAR = '\0';
let draggingChar = NO_CHAR;

const COLOR_YELLOW = "rgb(200, 200, 0)";
const COLOR_RED = "rgb(255, 0, 0)";
const COLOR_GREEN = "rgb(0, 255, 0)";

grid = [];
let startPos = null;
let endPos = null;
let selectingStart = false;
let selectingEnd = false;
let visibleRows = initialNRows;
let visibleCols = initialNCols;

window.onload = function () {
    let rowInput = $("rowInput");
    let colInput = $("colInput");
    rowInput.value = initialNRows;
    colInput.value = initialNCols;
    [rowInput.min, rowInput.max] = nRowRange;
    [colInput.min, colInput.max] = nColRange;

    $("badRowInput").textContent =
        `nRows must be a number between ${nRowRange[0]} and ${nRowRange[1]}`;
    $("badColInput").textContent =
        `nCols must be a number between ${nColRange[0]} and ${nColRange[1]}`;

    document.addEventListener('keydown', (e) => {
        if (e.code == 'Escape') {
            if (document.activeElement == $("rowInput") || document.activeElement == $("colInput")) {
                return;
            }
            if (selectingStart) {
                selectingStart = false;
                $("selectMessage").style.visibility = "hidden";
            }
            else if (selectingEnd) {
                selectingEnd = false;
                $("selectMessage").style.visibility = "hidden";
            }
            else {
                clearMaze();
            }
        }
        else if (e.code == 'KeyS') {
            selectStartClick();
        }
        else if (e.code == 'KeyE') {
            selectEndClick();
        }
    });

    checkParameters();
    initGrid();
};

function mazeMouseDown(e) {
    if (e.target.nodeName != "TILE") return;
    let [row, col] = e.target.getAttribute("data-rowcol").split(',').map(x => parseInt(x));
    let isWall = e.target.textContent == WALL_CHAR;
    if (selectingStart) {
        if (!isWall) {
            setStartPosition(row, col);
        }
        return;
    }
    else if (selectingEnd) {
        if (!isWall) {
            setEndPosition(row, col);
        }
        return;
    }
    else {
        let clickStart = startPos && startPos.row == row && startPos.col == col;
        let clickEnd = endPos && endPos.row == row && endPos.col == col;
        let isEdge = row == 0 || row == visibleRows - 1 || col == 0 || col == visibleCols - 1;
        // don't do anything if you click on an important tile
        if (clickStart || clickEnd) {
            return;
        }
        draggingChar = isWall ? OPEN_CHAR : WALL_CHAR;
        // don't overwrite the border
        if (!isEdge) {
            e.target.textContent = draggingChar;
        }
    }
}

function mazeMouseUp(e) {
    if (draggingChar != NO_CHAR) {
        draggingChar = NO_CHAR;
        updateCode();
    }
}

function mazeMouseMove(e) {
    if (e.target.nodeName != "TILE") return;
    else if (draggingChar == NO_CHAR) return;
    if ((e.buttons & 1) == 0) { // left click is released
        draggingChar = NO_CHAR;
        updateCode();
        return;
    }
    let [row, col] = e.target.getAttribute("data-rowcol").split(',');
    // prevent overwriting the start, end, and outer walls
    let isStart = startPos && e.target == grid[startPos.row][startPos.col];
    let isEnd = endPos && e.target == grid[endPos.row][endPos.col];
    let isEdge = row == 0 || row == visibleRows - 1 || col == 0 || col == visibleCols - 1;
    if (draggingChar != NO_CHAR && !isStart && !isEnd && !isEdge) {
        e.target.textContent = draggingChar;
    }
}

function clearMaze() {
    if (!tryGetSize(size = {}))
        return;
    for (let r = 0; r < size.rows; r++) {
        for (let c = 0; c < size.cols; c++) {
            let isEdge = r == 0 || r == size.rows - 1 || c == 0 || c == size.cols - 1;
            grid[r][c].textContent = isEdge ? WALL_CHAR : OPEN_CHAR;
        }
    }
    updateCode();
}

function initGrid() {
    if (!tryGetSize(size = {}))
        return;
    let container = $("mazeContainer");
    for (let r = 0; r < nRowRange[1]; r++) {
        tileRow = [];
        for (let c = 0; c < nColRange[1]; c++) {
            let tile = document.createElement("tile");
            tile.setAttribute("data-rowcol", `${r},${c}`);
            let isEdge = r == 0 || r == size.rows - 1 || c == 0 || c == size.cols - 1;
            tile.textContent = isEdge ? WALL_CHAR : OPEN_CHAR;
            tile.hidden = r >= size.rows || c >= size.cols;
            tileRow.push(tile);
            container.appendChild(tile);
        }
        container.appendChild(document.createElement("div"));
        grid.push(tileRow);
    }
}

function makeGrid() {
    if (!tryGetSize(size = {})) {
        updateCode();
        return;
    }
    // clear the old outer walls
    for (let r = 0; r < nRowRange[1]; r++) {
        grid[r][visibleCols - 1].textContent = OPEN_CHAR;
    }
    for (let c = 0; c < nColRange[1]; c++) {
        grid[visibleRows - 1][c].textContent = OPEN_CHAR;
    }
    // make the new size visible
    for (let r = 0; r < nRowRange[1]; r++) {
        for (let c = 0; c < nColRange[1]; c++) {
            let inside = r < size.rows && c < size.cols;
            grid[r][c].hidden = !inside;
            // add outer walls
            let isEdge = r == 0 || c == 0 || r == size.rows - 1 || c == size.cols - 1;
            if (isEdge) {
                grid[r][c].textContent = WALL_CHAR;
            }
        }
    }
    visibleRows = size.rows;
    visibleCols = size.cols;
    if (startPos) {
        if (startPos.row >= size.rows - 1 || startPos.col >= size.cols - 1) {
            grid[startPos.row][startPos.col].style.backgroundColor = "";
            startPos = null;
        }
    }
    if (endPos) {
        if (endPos.row >= size.rows - 1 || endPos.col >= size.cols - 1) {
            grid[endPos.row][endPos.col].style.backgroundColor = "";
            endPos = null;
        }
    }
    updateCode();
}

function selectStartClick() {
    $("selectMessage").textContent = "Click to choose a start square (ESC to cancel)";
    $("selectMessage").style.visibility = "visible";
    selectingEnd = false;
    selectingStart = true;
}

function selectEndClick() {
    $("selectMessage").textContent = "Click to choose an end square (ESC to cancel)";
    $("selectMessage").style.visibility = "visible";
    selectingStart = false;
    selectingEnd = true;
}

function setStartPosition(row, col) {
    selectingStart = false;
    $("selectMessage").style.visibility = "hidden";
    if (startPos) {
        let oldTile = grid[startPos.row][startPos.col];
        let oldColor = oldTile.style.backgroundColor;
        oldTile.style.backgroundColor = oldColor == COLOR_YELLOW ? COLOR_RED : "";
    }
    startPos = { row: row, col: col };
    let tile = grid[row][col];
    if (endPos && row == endPos.row && col == endPos.col) {
        tile.style.backgroundColor = COLOR_YELLOW;
    }
    else {
        tile.style.backgroundColor = COLOR_GREEN;
    }
    updateCode();
}

function setEndPosition(row, col) {
    selectingEnd = false;
    $("selectMessage").style.visibility = "hidden";
    if (endPos) {
        let oldTile = grid[endPos.row][endPos.col];
        let oldColor = oldTile.style.backgroundColor;
        oldTile.style.backgroundColor = oldColor == COLOR_YELLOW ? COLOR_GREEN : "";
    }
    endPos = { row: row, col: col };
    let tile = grid[row][col];
    if (startPos && row == startPos.row && col == startPos.col) {
        tile.style.backgroundColor = COLOR_YELLOW;
    }
    else {
        tile.style.backgroundColor = COLOR_RED;
    }
    updateCode();
}

function tryGetSize(size) {
    let nRows = parseInt($("rowInput").value);
    let nCols = parseInt($("colInput").value);
    let goodR = !isNaN(nRows) && nRowRange[0] <= nRows && nRows <= nRowRange[1];
    let goodC = !isNaN(nCols) && nColRange[0] <= nCols && nCols <= nColRange[1];
    $("badRowInput").hidden = goodR;
    $("badColInput").hidden = goodC;
    if (goodR && goodC) {
        size.rows = nRows;
        size.cols = nCols;
    }
    return goodR && goodC;
}

function checkParameters() {
    return tryGetSize({});
}

function updateCode() {
    if (!startPos || !endPos) {
        $("selectPointsMessage").hidden = false;
        $("outputContainer").hidden = true;
    }
    else {
        $("solvableMessage").textContent = isMazeSolvable() ? "yes" : "no";
        $("cppOutput").textContent = getSourceText();
        $("selectPointsMessage").hidden = true;
        $("outputContainer").hidden = false;
    }
}

function getSourceText() {
    const nRows = visibleRows;
    const nCols = visibleCols;
    const { row: sr, col: sc } = startPos;
    const { row: er, col: ec } = endPos;

    const solvable = isMazeSolvable();

    function stringifyRows() {
        let strings = Array(nRows).fill(0).map((_, row) => {
            let str = "";
            for (let col = 0; col < nCols; col++) {
                str += grid[row][col].textContent;
            }
            return `        "${str}"`; // indent by 8 spaces
        });
        return strings.join('\n');
    }

    return `
// append this to your source file below pathExists
#include <cassert>
#include <iostream>
using namespace std;

int main() {
    // Generated at TomBinford.github.io/mazes
    // credit is required per http://web.cs.ucla.edu/classes/winter23/cs32/integrity.html

    string maze[${nRows}] = {
${stringifyRows() /* do not indent this */}
    };
    // the first call to pathExists might modify maze
    string copy[${nRows}] = maze;

    assert(${solvable ? '' : '! '}pathExists(maze, ${nRows},${nCols}, ${sr},${sc}, ${er},${ec}));
    assert(${solvable ? '' : '! '}pathExists(copy, ${nRows},${nCols}, ${er},${ec}, ${sr},${sc}));
}`;
}

function isMazeSolvable() {
    // If you viewed page source to copy this,
    // you're not as clever as you think you are.
    const { row: sr, col: sc } = startPos;
    const { row: er, col: ec } = endPos;

    const seen = new Set();
    const dr = [1, -1, 0, 0];
    const dc = [0, 0, 1, -1];
    function dfs(row, col) {
        if (row < 0 || row >= visibleRows || col < 0 || col >= visibleCols)
            return false;
        else if (row == er && col == ec)
            return true;
        else if (grid[row][col].textContent == WALL_CHAR || seen.has(`${row},${col}`))
            return false;
        seen.add(`${row},${col}`);
        for (let dir = 0; dir < 4; dir++) {
            if (dfs(row + dr[dir], col + dc[dir]))
                return true;
        }
        return false;
    }
    return dfs(sr, sc);
}

let timeoutId;
let timeoutRunning = false;
let clickCount = 0;

function copyCpp() {
    if (clickCount >= 10) {
        return;
    }
    if (timeoutRunning) {
        clearTimeout(timeoutId);
        timeoutRunning = false;
        clickCount++;
        if (clickCount >= 10) {
            $("copiedLabel").textContent = "You are why we can't have nice things.";
            $("copiedLabel").style.color = "red";
            $("copiedLabel").style.visibility = "visible";
            return;
        }
    }
    let text = $("cppOutput").textContent;
    navigator.clipboard.writeText(text);
    $("copiedLabel").style.visibility = "visible";
    timeoutRunning = true;
    timeoutId = setTimeout(() => {
        $("copiedLabel").style.visibility = "hidden";
        timeoutRunning = false;
        clickCount = 0;
    }, 500);
}

function randomizeMaze() {
    for (let r = 1; r < visibleRows - 1; r++) {
        for (let c = 1; c < visibleCols - 1; c++) {
            let shouldFill = Math.random() < 0.5;
            let isStart = startPos && startPos.row == r && startPos.col == c;
            let isEnd = endPos && endPos.row == r && endPos.col == c;
            let doFill = shouldFill && !isStart && !isEnd;
            grid[r][c].textContent = doFill ? WALL_CHAR : OPEN_CHAR
        }
    }
    updateCode();
}
