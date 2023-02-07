const $ = id => document.getElementById(id);

function runStatistics(nTrials) {
    let nValid = 0;
    console.log(`Running ${nTrials} trials...`);
    start = performance.now();
    let i = 0;
    let sumLengths = 0;
    for (i = 0; i < nTrials; i++) {
        let ex = randomInfixExpression();
        let ok = tryEvaluateInfix(ex).ok;
        sumLengths += ex.length;
        if (ok) nValid++;
    }
    console.log(`Out of ${nTrials} expressions, ${nValid} were valid`);
    console.log(`Average length of ${sumLengths / nTrials}`);
    console.log(`testing took ${(performance.now() - start)} ms`);
}

window.onload = function () {
    $("testCountInput").value = 10;
    $("includeValidCheckbox").checked = true;
    $("includeInvalidCheckbox").checked = true;

    // runStatistics(1000);
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
    const mapTF = { 't': 'true ', 'f': 'false ', '|': '||', '&': '&&' };
    const mapFT = { 't': 'false ', 'f': 'true ', '|': '||', '&': '&&' };
    infix = infix.replace(' ', '');
    if (infix.includes("t(") || infix.includes("f(")) {
        return { ok: false };
    }
    let infixTF = infix.replace(/[tf|&]/g, m => mapTF[m]);
    let infixFT = infix.replace(/[tf|&]/g, m => mapFT[m]);
    try {
        // eval(infix) is tricky because of short circuiting -
        // an expression like "f|f&t()" short circuits to false,
        // and even switching true with false (what I originally tried)
        // doesn't entirely help with the above expression. JS is lazy and
        // doesn't look at the right side of an operator if it can short circuit.
        // The best I can come up with is checking for 't' or 'f'
        // immediately followed by '(' - this pattern fits every
        // bad expression I've seen so far.
        let result = eval(infixTF);
        let _ = eval(infixFT);
        if (result === true || result === false) {
            return { ok: true, result: result };
        }
        else {
            return { ok: false };
        }
    }
    catch {
        return { ok: false };
    }
}

function isValidInfix(infix) {
    
    infix = infix.replace(' ', '');
    if (infix.includes("t(") || infix.includes("f(")) {
        return false;
    }
    // https://stackoverflow.com/a/44475397
    const mapTF = { 't': 'true ', 'f': 'false ', '|': '||', '&': '&&' };
    const mapFT = { 't': 'false ', 'f': 'true ', '|': '||', '&': '&&' };
    let infixTF = infix.replace(/[tf|&]/g, m => mapTF[m]);
    let infixFT = infix.replace(/[tf|&]/g, m => mapFT[m]);
    try {
        // eval(infix) is tricky because of short circuiting -
        // an expression like "f|f&t()" short circuits to false,
        // and even switching true with false (what I originally tried)
        // doesn't entirely help with the above expression. JS is lazy and
        // doesn't look at the right side of an operator if it can short circuit.
        // The best I can come up with is checking for 't' or 'f'
        // immediately followed by '(' - this pattern fits every
        // bad expression I've seen so far.
        let result = eval(infixTF);
        let _ = eval(infixFT);
        if (result === true || result === false) {
            return true;
        }
        else {
            return false;
        }
    }
    catch {
        return false;
    }
}

function buildTestCases() {
    let nTestCases = parseInt($("testCountInput").value);
    if (isNaN(nTestCases) || nTestCases <= 0 || nTestCases > $("testCountInput").max) {
        $("invalidTestCountMessage").style.visibility = "visible";
        return;
    }
    $("invalidTestCountMessage").style.visibility = "hidden";

    let includeValid = $("includeValidCheckbox").checked;
    let includeInvalid = $("includeInvalidCheckbox").checked;
    if (!includeValid && !includeInvalid) {
        $("output").textContent = "";
        return;
    }
    $("output").textContent =
        "// generated at TomBinford.github.io/expressions\n" +
        "// credit is required per http://web.cs.ucla.edu/classes/winter23/cs32/integrity.html \n" +
        Array(nTestCases).fill(0).map(_ => {
            while (true) {
                let ex = randomInfixExpression();
                let ok = tryEvaluateInfix(ex).ok;
                if (ok && !includeValid) continue;
                else if (!ok && !includeInvalid) continue;
                // forming a valid expression is much rarer than an invalid one.
                // this else if serves to "retry" the generation with high probability if
                // we generate an invalid expression but we can accept valid ones.
                // by doing this, we get a higher proportion of valid expressions
                // in the output which looks more natural.
                else if (!ok && includeValid && Math.random() < 0.95) {
                    continue;
                }
                else {
                    return assertFromInfix(ex);
                }
            }
        }).join('\n');
    $("copyOutputButton").hidden = false;
    $("output").hidden = false;
}

function assertFromInfix(infix) {
    let evaluated = tryEvaluateInfix(infix);
    let callEvaluate = `evaluate("${infix}", tset, fset, pf, answer)`;
    if (evaluated.ok) {
        return `assert(${callEvaluate} == 0 && ${evaluated.result ? '' : '!'}answer);`;
    }
    else {
        return `assert(${callEvaluate} == 1);`;
    }
}

function randomInfixExpression() {
    // make spaces and ! less common by doubling everything else
    const choices = "ttff&&||(())" + " !";
    let length = 4 + Math.floor(Math.random() * 3);
    let expr = "";
    for (let i = 0; i < length; i++) {
        expr += choices[Math.floor(Math.random() * choices.length)];
    }
    return expr;
}

function generateValidAssert() {
    let ast = randomAST();
    let infix = ast.toInfix();
    let postfix = ast.toPostfix();
    let evaluatesTrue = ast.evaluate();
    return `assert(evaluate("${infix}", tset, fset, pf, answer) == 0 && pf == "${postfix}" && ${evaluatesTrue ? '' : '!'}answer);`;
}

function generateInvalidAssert() {
    let e;
    do {
        e = randomInfixExpression();
    } while (isValidInfix(e));
    return `assert(evaluate("${e}", tset, fset, pf, answer) == 1);`;
}

function randomAST() {
    function generateNode(depth) {
        if (depth == 0) {
            return Atom(Math.random() < 0.5 ? 't' : 'f');
        }
        const options = [Kind.Parens, Kind.Not, Kind.And, Kind.Or];
        switch (options[Math.floor(Math.random() * options.length)]) {
            case Kind.Parens:
                return Parens(generateNode(depth - 1));
            case Kind.Not:
                return Not(generateNode(depth - 1));
            case Kind.And:
                return And(generateNode(depth - 1), generateNode(depth - 1));
            case Kind.Or:
                return Or(generateNode(depth - 1), generateNode(depth - 1));
        }
    }
    return generateNode(4);
}
