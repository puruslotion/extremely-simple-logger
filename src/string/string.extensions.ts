interface String {
    black(): string
    blackBg(): string
    red(): string
    redBg(): string
    green(): string
    greenBg(): string
    yellow(): string
    yellowBg(): string
    blue(): string
    blueBg(): string
    magenta(): string
    magentaBg(): string
    cyan(): string
    cyanBg(): string
    white(): string
    whiteBg(): string
    reset(): string
    bright(): string
    dim(): string
    underscore(): string
    blink(): string
    reverse(): string
    hidden(): string
}

String.prototype.black = function () {
    return `\x1b[30m${this}`
}

String.prototype.blackBg = function () {
    return `\x1b[40m${this}`
}

String.prototype.red = function () {
    return `\x1b[31m${this}`
}

String.prototype.redBg = function () {
    return `\x1b[41m${this}`
}

String.prototype.green = function () {
    return `\x1b[32m${this}`
}

String.prototype.greenBg = function () {
    return `\x1b[42m${this}`
}

String.prototype.yellow = function () {
    return `\x1b[33m${this}`
}

String.prototype.yellowBg = function () {
    return `\x1b[43m${this}`
}

String.prototype.blue = function () {
    return `\x1b[34m${this}`
}

String.prototype.blueBg = function () {
    return `\x1b[44m${this}`
}

String.prototype.magenta = function () {
    return `\x1b[35m${this}`
}

String.prototype.magentaBg = function () {
    return `\x1b[45m${this}`
}

String.prototype.cyan = function () {
    return `\x1b[36m${this}`
}

String.prototype.cyanBg = function () {
    return `\x1b[46m${this}`
}

String.prototype.white = function () {
    return `\x1b[37m${this}`
}

String.prototype.whiteBg = function () {
    return `\x1b[47m${this}`
}

String.prototype.reset = function () {
    return `\x1b[0m${this}\x1b[0m`
}

String.prototype.bright = function () {
    return `\x1b[1m${this}`
}

String.prototype.dim = function () {
    return `\x1b[2m${this}`
}

String.prototype.underscore = function () {
    return `\x1b[4m${this}`
}

String.prototype.blink = function () {
    return `\x1b[5m${this}`
}

String.prototype.reverse = function () {
    return `\x1b[7m${this}`
}

String.prototype.hidden = function () {
    return `\x1b[8m${this}`
}
