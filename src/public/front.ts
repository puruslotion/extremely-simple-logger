type TagSet = {
    key: string,
    value: string
}

type FieldSet = {
    key: string
    value : string | number | boolean
}

class LogData {
    private _timestamp: string | number
    private _level: string
    private _tagSets: TagSet[]
    private _message: string
    private _fieldSets: FieldSet[]
    private _measurementName: string

    constructor(json: any) {
        this._timestamp = json?.timestamp
        this._level = json?.level
        this._tagSets = json?.tagSets
        this._message = json?.message
        this._fieldSets = json?.fieldSets
        this._measurementName = json?.measurenentName
    }

    public get timestamp(): string | number {
        return this._timestamp
    }

    public get level(): string {
        return this._level
    }

    public get tagSets(): TagSet[] {
        return this._tagSets
    }

    public get message(): string {
        return this._message
    }

    public get fieldSets(): FieldSet[] {
        return this._fieldSets
    }

    public get measurementName(): string {
        return this._measurementName
    }
}

const scrollableDivBackgroundColor = "#303030"
let scrollableDiv: HTMLDivElement = document.getElementById("scrollableDiv") as HTMLDivElement
scrollableDiv.style.backgroundColor = scrollableDivBackgroundColor
let sticky: HTMLInputElement = document.getElementById("sticky") as HTMLInputElement
sticky.checked = true

let observer = new MutationObserver(() => {
    if (scrollableDiv.children.length > 1000) {
       scrollableDiv.removeChild(scrollableDiv.children[0])
    }

    if (!sticky.checked) return 

    scrollableDiv.scrollTop = scrollableDiv.scrollHeight
})

observer.observe(scrollableDiv, {
    childList: true
})

function createSpan(color: string, text: string, backgroundColor?: string) {
    let s = document.createElement("span")
    s.style.color = color

    if (backgroundColor) {
        s.style.backgroundColor = backgroundColor
    }

    s.textContent = text

    return s
}

function createParagraph() {
    let para = document.createElement("p")

    return para
}

function createLevel(level: string): HTMLSpanElement {
    switch(level.toLowerCase()) {
        case "inf": return createSpan("white", " INF ", "green")
        case "deb": return createSpan("white", " DEB ", "cyan")
        case "war": return createSpan("black", " WAR ", "yellow")
        case "err": return createSpan("white", " ERR ", "red")
        case "fat": return createSpan("white", " FAT ", "magenta")
        default: return createSpan("", "", "")
    }
}

function createTags(para: HTMLParagraphElement,  logData: LogData) {
    if (!logData.tagSets) return

    para.appendChild(createSpan("white", "["))
    
    let counter = 1
    
    for (let tagSet of logData.tagSets) {
        if (tagSet.key.toLowerCase() === "level") continue

        para.appendChild(createSpan("white", tagSet.key + ": "))
        para.appendChild(createSpan("rgb(238,130,238)", tagSet.value))

        if (counter === logData.tagSets.length - 1) {
            break
        }

        para.appendChild(createSpan("white", ", "))

        ++counter
    }

    para.appendChild(createSpan("white", "]"))
}

function createFieldSets(para: HTMLParagraphElement,  logData: LogData) {
    if (!logData.tagSets) return

    para.appendChild(createSpan("white", "["))

    let counter = 1
    
    for (let fieldSet of logData.fieldSets) {
        if (fieldSet.key.toLowerCase() === "message") continue

        para.appendChild(createSpan("white", fieldSet.key + ": "))

        if (typeof fieldSet.value === "boolean") {
            para.appendChild(createSpan("rgb(0, 150, 255)", String(fieldSet.value)))
        } else if (typeof fieldSet.value === "number") {
            para.appendChild(createSpan("cyan",  String(fieldSet.value)))
        } else {
            para.appendChild(createSpan("lawngreen", "\"" + fieldSet.value + "\""))
        }

        if (counter === logData.fieldSets.length - 1) {
            break
        }

        para.appendChild(createSpan("white", ", "))
        
        ++counter
    }

    para.appendChild(createSpan("white", "]"))

}

function printData(logData: LogData) {
    let para = createParagraph()
    para.appendChild(createSpan("white", logData.timestamp.toString()))
    para.appendChild(createSpan(scrollableDivBackgroundColor, "."))
    
    para.appendChild(createLevel(logData.level))
    para.appendChild(createSpan(scrollableDivBackgroundColor, "."))
    
    createTags(para, logData)
    para.appendChild(createSpan(scrollableDivBackgroundColor, "."))

    createFieldSets(para, logData)
    para.appendChild(createSpan(scrollableDivBackgroundColor, "."))

    para.appendChild(createSpan("white", logData.message))
    
    scrollableDiv.appendChild(para)
}

let socket: WebSocket

function connect() {
    socket = new WebSocket("ws://localhost:8080");

    socket.onopen = function(e) {
        let para = createParagraph()
        para.appendChild(createSpan("white", new Date().toISOString()))
        para.appendChild(createSpan(scrollableDivBackgroundColor, "."))
        para.appendChild(createLevel("inf"))
        para.appendChild(createSpan(scrollableDivBackgroundColor, "."))
        para.appendChild(createSpan("lawngreen", "Websocket open"))

        scrollableDiv.appendChild(para)
    };

    socket.onmessage = function(event) {
        printData(JSON.parse(event.data) as LogData)
    };

    socket.onclose = function(event) {
        socket?.close()

        let para = createParagraph()
        para.appendChild(createSpan("white", new Date().toISOString()))
        para.appendChild(createSpan(scrollableDivBackgroundColor, "."))
        para.appendChild(createLevel("war"))
        para.appendChild(createSpan(scrollableDivBackgroundColor, "."))
        para.appendChild(createSpan("orange", "Websocket closed"))

        scrollableDiv.appendChild(para)

        setTimeout(connect, 5000);
    };

    socket.onerror = function(error: any) {
        socket?.close()

        let para = createParagraph()
        para.appendChild(createSpan("white", new Date().toISOString()))
        para.appendChild(createSpan(scrollableDivBackgroundColor, "."))
        para.appendChild(createLevel("err"))
        para.appendChild(createSpan(scrollableDivBackgroundColor, "."))
        para.appendChild(createSpan("red", "Websocket error"))

        scrollableDiv.appendChild(para)
    };
}

document.addEventListener("DOMContentLoaded", () => {
    let mainDiv: HTMLDivElement = document.getElementById("mainDiv") as HTMLDivElement
    mainDiv.style.width = window.innerWidth.toString() + "px"
    mainDiv.style.height = window.innerHeight.toString() + "px"

    connect()
})
