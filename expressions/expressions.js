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

function tryEvaluateInfix(infix) {
    // https://stackoverflow.com/a/44475397
    const map = {
        't': 'true',
        'f': 'false',
        '|': '||',
        '&': '&&'
    };
    infix = infix.replace(/[tf|&]/g, m => map[m]);
    try {
        let result = eval(infix);
        return { ok: true, result: result };
    }
    catch {
        return { ok: false };
    }
}

function buildTestCases() {
    let nTestCases = parseInt($("testCountInput").value);
    if (isNaN(nTestCases) || nTestCases <= 0 || nTestCases > $("testCountInput").max) {
        $("invalidTestCountMessage").style.visibility = "visible";
        return;
    }
    $("invalidTestCountMessage").style.visibility = "hidden";
    $("output").textContent = Array(nTestCases).fill(0).map(_ => {
        return assertFromInfix(randomInfixExpression());
    }).join('\n');
    $("copyOutputButton").hidden = false;
    $("output").hidden = false;
}

function assertFromInfix(infix) {
    let evaluated = tryEvaluateInfix(infix);
    let callEvaluate = `evaluate("${infix}", tset, fset, pf, answer)`;
    if(evaluated.ok) {
        return `assert(${callEvaluate} == 0 && ${evaluated.result ? '' : '!'}answer);`;
    }
    else {
        return `assert(${callEvaluate} == 1);`;
    }
}

function randomInfixExpression() {
    let choices = ["t|f&t", "t&!f|()", "(f|f&!t)"];
    return choices[Math.floor(Math.random() * choices.length)];
}