const $ = id => document.getElementById(id);

window.onload = function () {
    $("testCountInput").value = 10;
};

let copyPreambleTimeoutId;
function copyPreamble() {
    let preamble = $("preamble");
    navigator.clipboard.writeText(preamble.textContent);
    $("preambleCopiedMessage").hidden = false;
    clearTimeout(copyPreambleTimeoutId);
    copyPreambleTimeoutId = setTimeout(() => {
        $("preambleCopiedMessage").hidden = true;
    }, 250);
}

let copyOutputTimeoutId;
function copyOutput() {
    let output = $("output");
    navigator.clipboard.writeText(output.textContent);
    $("outputCopiedMessage").hidden = false;
    clearTimeout(copyOutputTimeoutId);
    copyOutputTimeoutId = setTimeout(() => {
        $("outputCopiedMessage").hidden = true;
    }, 250);
}

function buildTestCases() {
    $("copyOutputButton").hidden = false;
    $("output").hidden = false;
}