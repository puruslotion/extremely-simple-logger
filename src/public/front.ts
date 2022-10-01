type TagSet = {
    key: string,
    value: string
}

type FieldSet = {
    key: string
    value : string | number | boolean
}

class Settings {
    private _webSocketServerPort: number
    private _title: string

    constructor(json: any) {
        this._webSocketServerPort = json?.WebSocketServerPort
        this._title = json?.Title ?? "Extremely Simple Logger"
    }

    public get webSocketServerPort(): number {
        return this._webSocketServerPort
    }

    public get title(): string {
        return this._title
    }
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

enum Color {
    LightYellow = "#f1e678",
    Orange = "#ed8f60",
    Pink = "#bf406c",
    Purple = "#682a6e",
    DeepPurle = "#181818",
    LightGreen = "rgb(0, 255, 130)",
    LightBlue = "rgb(0, 180, 255)",
    DarkWhite = "#E1D9D1",
    White = "white",
    Red = "red",
    Black = "black",
    Cyan = "cyan",
    Magenta = "magenta",
    Green = "green",
    Yellow = "yellow"
}

let settings: Settings
let scrollableDiv: HTMLDivElement = document.getElementById("scrollableDiv") as HTMLDivElement

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
        case "inf": return createSpan(Color.White, " INF ", Color.Green)
        case "deb": return createSpan(Color.White, " DEB ", Color.Cyan)
        case "war": return createSpan(Color.Black, " WAR ", Color.Yellow)
        case "err": return createSpan(Color.White, " ERR ", Color.Red)
        case "fat": return createSpan(Color.White, " FAT ", Color.Magenta)
        default: return createSpan("", "", "")
    }
}

function createTags(para: HTMLParagraphElement,  logData: LogData) {
    if (!logData.tagSets || logData.tagSets.length <= 1) return

    let tags = createSpan(Color.Pink, "Tags")
    tags.style.fontWeight = "bold"
    para.appendChild(tags)
    para.appendChild(createSpan(Color.DarkWhite, "["))
    
    let counter = 1
    
    for (let tagSet of logData.tagSets) {
        if (tagSet.key.toLowerCase() === "level") continue

        para.appendChild(createSpan(Color.DarkWhite, tagSet.key + ": "))
        para.appendChild(createSpan(Color.Yellow, tagSet.value))

        if (counter === logData.tagSets.length - 1) {
            break
        }

        para.appendChild(createSpan(Color.DarkWhite, ", "))

        ++counter
    }

    para.appendChild(createSpan(Color.DarkWhite, "]"))
}

function createFieldSets(para: HTMLParagraphElement,  logData: LogData) {
    if (!logData.tagSets || logData.tagSets.length <= 1) return

    let fields = createSpan(Color.Pink, "Fields")
    fields.style.fontWeight = "bold"
    para.appendChild(fields)
    para.appendChild(createSpan(Color.DarkWhite, "["))

    let counter = 1
    
    for (let fieldSet of logData.fieldSets) {
        if (fieldSet.key.toLowerCase() === "message") continue

        para.appendChild(createSpan(Color.DarkWhite, fieldSet.key + ": "))

        if (typeof fieldSet.value === "boolean") {
            para.appendChild(createSpan(Color.LightBlue, String(fieldSet.value)))
        } else if (typeof fieldSet.value === "number") {
            para.appendChild(createSpan(Color.LightGreen,  String(fieldSet.value)))
        } else {
            para.appendChild(createSpan(Color.Yellow, "\"" + fieldSet.value + "\""))
        }

        if (counter === logData.fieldSets.length - 1) {
            break
        }

        para.appendChild(createSpan(Color.DarkWhite, ", "))
        
        ++counter
    }

    para.appendChild(createSpan(Color.DarkWhite, "]"))
}

function printData(logData: LogData) {
    let para = createParagraph()
    para.appendChild(createSpan(Color.DarkWhite, logData.timestamp.toString().replace(/T/, " ").replace(/Z/, " UTC")))
    para.appendChild(createSpan(Color.DeepPurle, "."))
    
    para.appendChild(createLevel(logData.level))
    para.appendChild(createSpan(Color.DeepPurle, "."))
    
    if (logData?.tagSets?.length > 1) {
        createTags(para, logData)
        para.appendChild(createSpan(Color.DeepPurle, "."))
    }
    
    if (logData?.fieldSets?.length > 1) {
        createFieldSets(para, logData)
        para.appendChild(createSpan(Color.DeepPurle, "."))
    }
    
    let message = createSpan(Color.Pink, "Message: ")
    message.style.fontWeight = "bold"
    para.appendChild(message)
    para.appendChild(createSpan(Color.DarkWhite, logData.message))
    
    scrollableDiv.appendChild(para)
}

let webSocket: WebSocket

function connect() {
    webSocket = new WebSocket(`ws://${window.location.hostname}:${settings.webSocketServerPort}`);

    webSocket.onopen = function(e) {
    };

    webSocket.onmessage = function(event) {
        printData(JSON.parse(event.data) as LogData)
    };

    webSocket.onclose = function(event) {
        webSocket?.close()

        let para = createParagraph()
        para.appendChild(createSpan(Color.DarkWhite, new Date().toISOString()))
        para.appendChild(createSpan(Color.DeepPurle, "."))
        para.appendChild(createLevel("war"))
        para.appendChild(createSpan(Color.DeepPurle, "."))
        para.appendChild(createSpan(Color.Orange, "Websocket closed"))

        scrollableDiv.appendChild(para)

        setTimeout(connect, 5000);
    };

    webSocket.onerror = function(error: any) {
        webSocket?.close()

        let para = createParagraph()
        para.appendChild(createSpan(Color.DarkWhite, new Date().toISOString()))
        para.appendChild(createSpan(Color.DeepPurle, "."))
        para.appendChild(createLevel("err"))
        para.appendChild(createSpan(Color.DeepPurle, "."))
        para.appendChild(createSpan(Color.Red, "Websocket error"))

        scrollableDiv.appendChild(para)
    };
}

async function init() {
    let mainDiv: HTMLDivElement = document.getElementById("mainDiv") as HTMLDivElement
    mainDiv.style.width = window.innerWidth.toString() + "px"
    mainDiv.style.height = window.innerHeight.toString() + "px"

    let response = await fetch("/settings")
    settings = new Settings(await response.json())

    let header: HTMLHeadingElement = document.getElementById("header") as HTMLHeadingElement
    header.textContent = settings.title

    connect()
}

document.addEventListener("DOMContentLoaded", async () => {
    init()
})
