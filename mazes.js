const $ = id => document.getElementById(id)

const nRowRange = [3, 20]
const nColRange = nRowRange

let draggingChar = '\0'

window.onload = function () {
    let rowInput = $("rowInput")
    rowInput.select();
    rowInput.min = nRowRange[0];
    rowInput.max = nRowRange[1];
    let colInput = $("colInput")
    colInput.min = nColRange[0];
    colInput.max = nColRange[1];
    $("badRowInput").textContent =
        `nRows must be a number between ${nRowRange[0]} and ${nRowRange[1]}`
    $("badColInput").textContent =
        `nCols must be a number between ${nColRange[0]} and ${nColRange[1]}`
    
    checkParameters();
}

function checkParameters() {
    let nRows = parseInt($("rowInput").value)
    let nCols = parseInt($("colInput").value)
    let goodR = !isNaN(nRows) && nRowRange[0] <= nRows && nRows <= nRowRange[1]
    let goodC = !isNaN(nCols) && nColRange[0] <= nCols && nCols <= nColRange[1]
    $("badRowInput").hidden = goodR
    $("badColInput").hidden = goodC
    return goodR && goodC
}

function makeGrid() {
    if (!checkParameters())
        return
}