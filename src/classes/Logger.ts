import { BackgroundColor } from "../enums/BackgroundColor";
import { ForegroundColor } from "../enums/ForegroundColor";
import { Style } from "../enums/Style";
import { Level } from "../enums/Level";
import { LoggerOptions } from "../types/LoggerOptions";
import fs from "fs"
import { LogData } from "./LogData";
import { StringOptions } from "../types/StringOptions";
import '../string/string.extensions';
import { PrintOptions } from "../types/PrintOptions";
import { TagSet } from "../types/TagSet";
import { GZip } from "./GZip";
import { WebSocketServer } from "ws";
import http from 'http'
import path from "path";

export type LoggerSettings = {
    title?: string,
    pathToLogs?: string,
    maxNumberOfLinesPerInfluxProtocolFile?: number,
    maxNumberOfLinesInPreviouslyWrittenLogsArray?: number
}

export class Logger {
    private static _title: string = "Extremely Simple Logger"
    private static _pathToLogs: string = ""
    private static _logsToBeWrittenArr: LogData[ ]= []
    private static _maxNumberOfWrittenLines = 5000
    private static _wss: WebSocketServer
    private static _previouslyWrittenLogs: string[] = []
    private static _maxNumberOfPreviousWrittenLogs: number = 100
    private static _isWritingToFile = false
    private static _serverPort = 0
    private static _webSocketServerPort = 0

    public static init(loggerSettings: LoggerSettings): void {
        this.setTitle(loggerSettings?.title ?? "Extremely Simple Logger")
        this.setPathToLogs(loggerSettings?.pathToLogs ?? "")
        this._maxNumberOfWrittenLines = loggerSettings?.maxNumberOfLinesPerInfluxProtocolFile ?? 5000
        this.setMaxNumberOfPreviouslyWrittenLogs(loggerSettings?.maxNumberOfLinesInPreviouslyWrittenLogsArray ?? 100)
    }

    public static initServers(serverPort: number = 4000, webSocketServerPort: number = 8080) {
        this._serverPort = serverPort
        this._webSocketServerPort = webSocketServerPort
        this.startServer()
        this.startWebSocketServer()
    }

    private static startServer() {
        http.createServer((req, res) => {
            if (req.url === "/") {
                req.url = "index.html"
            }

            if (req.url === "/settings") {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                })
                res.end(JSON.stringify({
                    WebSocketServerPort: this._webSocketServerPort,
                    Title: this.getTitle()
                }))

                return
            }

            let uri = req.url?.replace(/\.\./gi, "") ?? ""
            let p = path.join(__dirname, '..', 'public', uri)
        
            fs.readFile(p, function (err, data) {
                if (err) {
                  res.writeHead(404);
                  res.end(JSON.stringify(err));
                  return;
                }
        
                if (req?.url?.includes("index.html")) {
                    res.writeHead(200,{
                        'Content-Type': 'text/html'
                    });
                    res.end(data);
                    return
                } else if (req?.url?.includes("front.js")) {
                    res.writeHead(200,{
                        'Content-Type': 'text/javascript'
                    });
                    res.end(data);
                    return
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({error: "File not available"}))
                    return
                }
              });
        }).listen(this._serverPort, () => {
            this.print(`Server started on port: ${this._serverPort}`, {
                level: Level.Information,
                tagSets: [{
                    key: "Server",
                    value: "Started"
                }]
            })
        })
    }

    private static startWebSocketServer() {
        this._wss = new WebSocketServer({ port: this._webSocketServerPort });

        this._wss.on("listening", () => {
            this.print(`WebSocket server started on port: ${this._webSocketServerPort}`, {
                level: Level.Information,
                tagSets: [{
                    key: "WebSocketServer",
                    value: "Started"
                }]
            })
        })
        
        this._wss.on('connection', (ws, req) => {
            this.getPreviouslyWrittenLogs().forEach((message: string) => {
                ws.send(message)
            })
            this.print(`Client connected from ${req.socket.remoteAddress}`, {
                level: Level.Information,
                tagSets: [{
                    key: "WebSocketServer",
                    value: "Client connected"
                }]
            })
        });
        
        this._wss.on("error", (error) => {
            this.print(error, {
                level: Level.Error,
                tagSets: [{
                    key: "WebSocketServer",
                    value: "Error"
                }]
            })
        })
        
        this._wss.on("close", () => {
            this.print("Close", {
                level: Level.Warning,
                tagSets: [{
                    key: "WebSocketServer",
                    value: "Close"
                }]
            })
        })
    }

    public static getTitle(): string {
        return this._title
    }

    public static  setTitle(title: string) {
        this._title = title
    }

    public static setPathToLogs(path: string) {
        this._pathToLogs = path
    }

    public static setMaxNumberOfPreviouslyWrittenLogs(maxNumberOfPreviouslyWrittenLogs: number) {
        this._maxNumberOfPreviousWrittenLogs = maxNumberOfPreviouslyWrittenLogs
    }

    public static getPreviouslyWrittenLogs(): string[] {
        return this._previouslyWrittenLogs
    }

    public static setWebSocketServer(webSocketServer: WebSocketServer) {
        this._wss = webSocketServer
    }

    public static colorString(message: string, stringOptions?: StringOptions) : string {
        let colorString = `${stringOptions?.style ?? Style.Default}`
        colorString += `${stringOptions?.backgroundColor ?? BackgroundColor.Default}`
        colorString += `${stringOptions?.foregroundColor ?? ForegroundColor.Default}`
        colorString += this.convertAnyToString(message)

        return this.resetString(colorString)
    }

    public static print(message: any, printOptions?: PrintOptions) {
        let logString = `${printOptions?.timestampStyle ?? Style.Default}`
        let timestamp = ""

        if (!printOptions?.timestamp) timestamp = new Date().toISOString()

        logString += `${printOptions?.timestampStyle ?? Style.Default}${printOptions?.timestampBackgroundColor ?? BackgroundColor.Default}${printOptions?.timestampForegroundColor ?? ForegroundColor.Default}${printOptions?.timestamp ?? timestamp.replace(/T/gi, " ").replace(/Z/gi, " UTC")}${Style.Reset}`

        if (printOptions?.level) {
            logString += `  ${this.getLevel(printOptions.level)}`
        }

        if (printOptions?.tagSets) {
            logString += `  ${"Tags".green().reset()}[${Style.Reset}${this.tagsToString(printOptions.tagSets)}${Style.Reset}]`
        }

        if (printOptions?.fieldSets) {
            logString += `  ${"Fields".green().reset()}[${Style.Reset}${this.fieldsToString(printOptions.fieldSets)}${Style.Reset}]`
        }

        logString += `  ${"Message: ".green().reset()}${this.convertAnyToString(message)}`

        process.stdout.write(`${this.resetString(logString)}\n`)

        let logData = new LogData(timestamp, printOptions?.level ?? Level.Default, message, undefined, printOptions?.tagSets, printOptions?.fieldSets)
        let messageToSend = JSON.stringify({
            timestamp: logData.getTimestamp(),
            level: printOptions?.level,
            tagSets: logData.getTagSets(),
            fieldSets: logData.getFieldSets(),
            message: logData.getMessage()
        })

        this._wss?.clients?.forEach((ws) => {
            ws.send(messageToSend)
        })

        this._previouslyWrittenLogs.push(messageToSend)

        if (this._previouslyWrittenLogs.length > this._maxNumberOfPreviousWrittenLogs) {
            this._previouslyWrittenLogs.shift()
        }
    }

    private static tagsToString(tags: TagSet[]): string {
        return tags.map((tag) => {
            return `${tag.key.white().reset()}: ${tag.value.yellow().reset()}`
        }).join(", ")
    }

    private static fieldsToString(fields: FieldSet[]): string {
        return fields.map((field) => {
            if (typeof field.value === "number") {
                return `${field.key.white().reset()}: ${field.value.toString().magenta().reset()}`
            } else if (typeof field.value === "boolean") {
                return `${field.key.white().reset()}: ${field.value.toString().blue().reset()}`
            } 

            return `${field.key.white().reset()}: ${field.value.yellow().reset()}`
        }).join(", ")
    }

    public static log(message: any, loggerOptions?: LoggerOptions): void {
        if (!this._pathToLogs) {
            this.print(`You need to set a path to logs folder with ${"setPathToLogsFolder()".yellow().reset()}. Message not saved: ${this.convertAnyToString(message).cyan()}`, {
                level: Level.Error,
                tagSets: [{
                    key: "LogsPath", 
                    value: "Undefined"
                }]
            })

            return
        }

        this._logsToBeWrittenArr.push(new LogData(
            loggerOptions?.timestamp ?? new Date().toISOString(), 
            loggerOptions?.level?.trim() ?? Level.Default, 
            this.convertAnyToString(message),
            loggerOptions?.measurementName ?? undefined,
            loggerOptions?.tagSets ?? undefined,
            loggerOptions?.fieldSets ?? undefined
        ))

        if (this._logsToBeWrittenArr.length >= this._maxNumberOfWrittenLines) {
            this.writeToInfluxDbFile()
        }
    }

    public static resetString(text?: string) {
        return `${Style.Reset}${text}${Style.Reset}`
    }

    public static rainbowString(message: string) : string {
        let maxNumberOfForegroundColors = Object.keys(ForegroundColor).length - 3
        let rainbowText = ""

        for (let i = 0; i < message.length; i++) {
            rainbowText += Style.Bright
            rainbowText += `${Object.values(ForegroundColor)[(Math.floor(Math.random() * maxNumberOfForegroundColors)) + 1]}`
            rainbowText += message[i]
        }
        
        return this.resetString(rainbowText)
    }

    private static getLevel(level: Level): string {
        switch (level) {
            case Level.Information:
                return ` ${level} `.greenBg().black().reset()
            case Level.Warning:
                return ` ${level} `.yellowBg().black().reset()
            case Level.Error:
                return ` ${level} `.redBg().white().reset()
            case Level.Fatal:
                return ` ${level} `.magentaBg().white().reset()
            case Level.Debug:
                return ` ${level} `.blueBg().white().reset()
            default:
                return this.resetString("")
        }
    }

    public static convertAnyToString(error: any): string {
        if (typeof error === "object") {
            let message = JSON.stringify(error)

            if (message !== "{}") return message

            return JSON.stringify({
                name: error?.name,
                message: error?.message,
                stack: error?.stack
            })
        } else if (typeof error === "undefined") {
            return "undefined"
        }

        return error.toString()
    }

    private static async writeToInfluxDbFile(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                this._isWritingToFile = true
                let tempArr = this._logsToBeWrittenArr.slice()
                this._logsToBeWrittenArr = []
        
                fs.mkdir(`${this._pathToLogs}`, {recursive: true}, async () => {
                    let p = path.join(this._pathToLogs, `from_${this.getDateForFileName(tempArr[0].getTimestamp())}_to_${this.getDateForFileName(tempArr[tempArr.length - 1].getTimestamp())}.log.gz`)
                    
                    let influxDbProtocolLines = ""
        
                    for (let i = 0; i < tempArr.length; i++) {
                        influxDbProtocolLines += tempArr[i].getInfluxDbLineProtocol() + "\n"
                    }
                    
                    await GZip.compress(influxDbProtocolLines, p)
        
                    this._isWritingToFile = false
                    
                    resolve(true)
                })
                setTimeout(() => {}, 1000)
            } catch (error) {
                this.print(error, {
                    level: Level.Error,
                    tagSets: [{
                        key: "InfluxDB", 
                        value: "Failed to write to file"
                    }]
                })

                reject(error)
            }
        })
    }

    public static async saveCurrentLogsToFile() {
        if (this._logsToBeWrittenArr.length === 0) return

        await this.writeToInfluxDbFile()
    }

    private static getDateForFileName(timestamp: string | number) {
        let date = new Date(timestamp)
        return date.toISOString()
    }
}
