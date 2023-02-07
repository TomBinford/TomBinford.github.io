const Kind = Object.freeze({
    Atom: 1,
    Parens: 2,
    Not: 3,
    And: 4,
    Or: 5
});

function precedence(operatorKind) {
    switch (operatorKind) {
        case Kind.Atom: return 4;
        case Kind.Parens: return 4;
        case Kind.Not: return 3;
        case Kind.And: return 2;
        case Kind.Or: return 1;
    }
    console.log(`unknown operator ${operatorKind}`);
    return -1;
}

class Node {
    constructor(kind, children = []) {
        this.kind = kind;
        this.children = children;
    }

    toPostfix() {
        switch (this.kind) {
            case Kind.Atom:
                return this.value;
            case Kind.Parens:
                return this.children[0].toPostfix();
            case Kind.Not:
                return this.children[0].toPostfix() + "!";
            case Kind.And:
                return this.children[0].toPostfix() + this.children[1].toPostfix() + "&";
            case Kind.Or:
                return this.children[0].toPostfix() + this.children[1].toPostfix() + "|";
        }
    }

    toInfix() {
        switch (this.kind) {
            case Kind.Atom:
                return this.value;
            case Kind.Parens:
                return `(${this.children[0].toInfix()})`;
            case Kind.Not:
                if(this.children[0].kind == Kind.And || this.children[0].kind == Kind.Or) {
                    return `!(${this.children[0].toInfix()})`;
                }
                else {
                    return "!" + this.children[0].toInfix();
                }
            case Kind.And:
            case Kind.Or:
                let left = this.children[0].toInfix();
                if (precedence(this.children[0].kind) < precedence(this.kind)) {
                    left = "(" + left + ")";
                }
                let right = this.children[1].toInfix();
                if (precedence(this.children[1].kind) <= precedence(this.kind)) {
                    right = "(" + right + ")";
                }
                let symbol = this.kind == Kind.And ? "&" : "|";
                return left + symbol + right;
        }
    }

    evaluate() {
        switch (this.kind) {
            case Kind.Atom:
                return this.value == 't';
            case Kind.Parens:
                return this.children[0].evaluate();
            case Kind.Not:
                return !this.children[0].evaluate();
            case Kind.And:
                return this.children[0].evaluate() && this.children[1].evaluate();
            case Kind.Or:
                return this.children[0].evaluate() || this.children[1].evaluate();
        }
    }
}

function Atom(value) {
    a = new Node(Kind.Atom);
    a.value = value;
    return a;
}

function Parens(inner) {
    return new Node(Kind.Parens, [inner]);
}

function Not(inner) {
    return new Node(Kind.Not, [inner]);
}

function And(left, right) {
    return new Node(Kind.And, [left, right]);
}

function Or(left, right) {
    return new Node(Kind.Or, [left, right]);
}
