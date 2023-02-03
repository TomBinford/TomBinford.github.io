const $ = id => document.getElementById(id);

const nRowRange = [3, 20];
const nColRange = nRowRange;
const initialNRows = 10;
const initialNCols = 10;

const WALL_CHAR = 'X';
const OPEN_CHAR = '.';
const NO_CHAR = '\0';
let draggingChar = NO_CHAR;

grid = [];
let visibleRows;
let visibleCols;

window.onload = function () {
    let rowInput = $("rowInput");
    let colInput = $("colInput");
    visibleRows = rowInput.value = initialNRows;
    visibleCols = colInput.value = initialNCols;
    [rowInput.min, rowInput.max] = nRowRange;
    [colInput.min, colInput.max] = nColRange;

    $("badRowInput").textContent =
        `nRows must be a number between ${nRowRange[0]} and ${nRowRange[1]}`;
    $("badColInput").textContent =
        `nCols must be a number between ${nColRange[0]} and ${nColRange[1]}`;

    document.addEventListener('keydown', (e) => {
        if (e.code == 'Escape') clearMaze();
    });

    checkParameters();
    initGrid();
};

function mazeMouseDown(e) {
    if (e.target.nodeName != "TILE") return;
    let isWall = e.target.textContent == WALL_CHAR;
    draggingChar = isWall ? OPEN_CHAR : WALL_CHAR;
    e.target.textContent = draggingChar;
}

function mazeMouseUp(e) {
    draggingChar = NO_CHAR;
}

function mazeMouseMove(e) {
    if (e.target.nodeName != "TILE") return;
    if ((e.buttons & 1) == 0) { // left click is released
        draggingChar = NO_CHAR;
    }
    if (draggingChar != NO_CHAR) {
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
}

function initGrid() {
    if (!tryGetSize(size = {}))
        return;
    let container = $("mazeContainer");
    for (let r = 0; r < nRowRange[1]; r++) {
        tileRow = [];
        for (let c = 0; c < nColRange[1]; c++) {
            let tile = document.createElement("tile");
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
    if (!tryGetSize(size = {}))
        return;
    // clear the old outer walls
    for (let r = 0; r < nRowRange[1]; r++) {
        grid[r][visibleCols - 1].textContent = OPEN_CHAR;
    }
    for(let c = 0; c < nColRange[1]; c++) {
        grid[visibleRows - 1][c].textContent = OPEN_CHAR;
    }
    // make the new size visible
    for (let r = 0; r < nRowRange[1]; r++) {
        for (let c = 0; c < nColRange[1]; c++) {
            let inside = r < size.rows && c < size.cols;
            grid[r][c].hidden = !inside;
            // add outer walls
            let isEdge = r == 0 || c == 0 || r == size.rows - 1 || c == size.cols - 1;
            if(isEdge) {
                grid[r][c].textContent = WALL_CHAR;
            }
        }
    }
    visibleRows = size.rows;
    visibleCols = size.cols;
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
