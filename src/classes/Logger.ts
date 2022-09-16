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

export class Logger {
    private static _title: string = "Extremely Simple Logger"
    private static _pathToLogsFolder: string = ""
    private static _logsToBeWrittenArr: LogData[ ]= []
    private static _maxNumberOfWrittenLines = 5000
    private static _wss: WebSocketServer
    private static _previouslyWrittenLogs: string[] = []
    private static _maxNumberOfPreviousWrittenLogs: number = 100

    public static getTitle(): string {
        return this._title
    }

    public static  setTitle(title: string) {
        this._title = title
    }
    
    public static setPathToLogsFolder(path: string) {
        this._pathToLogsFolder = path

        if (this._pathToLogsFolder[this._pathToLogsFolder.length - 1] !== "/") {
            this._pathToLogsFolder += "/"
        } 
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
        colorString += Logger.convertAnyToString(message)

        return Logger.resetString(colorString)
    }

    public static print(message: any, printOptions?: PrintOptions) {
        let logString = `${printOptions?.timestampStyle ?? Style.Default}`
        let timestamp = ""

        if (!printOptions?.timestamp) timestamp = new Date().toISOString()

        logString += `${printOptions?.timestampStyle ?? Style.Default}${printOptions?.timestampBackgroundColor ?? BackgroundColor.Default}${printOptions?.timestampForegroundColor ?? ForegroundColor.Yellow}${printOptions?.timestamp ?? timestamp}${Style.Reset}`

        if (printOptions?.level) {
            logString += `  ${this.getLevel(printOptions.level)}`
        }

        if (printOptions?.tagSets) {
            logString += `  [ ${Style.Reset}${this.tagsToString(printOptions.tagSets)}${Style.Reset} ]`
        }

        logString += `  ${Logger.convertAnyToString(message)}`

        process.stdout.write(`${Logger.resetString(logString)}\n`)

        let logData = new LogData(timestamp, printOptions?.level ?? Level.Default, message, undefined, printOptions?.tagSets, printOptions?.fieldSet)
        let messageToSend = JSON.stringify({
            timestamp: logData.getTimestamp(),
            level: printOptions?.level,
            tagSets: logData.getTagSets(),
            fieldSets: logData.getFieldSets(),
            message: logData.getMessage()
        })

        this._wss.clients.forEach((ws) => {
            ws.send(messageToSend)
        })

        this._previouslyWrittenLogs.push(messageToSend)

        if (this._previouslyWrittenLogs.length > this._maxNumberOfPreviousWrittenLogs) {
            this._previouslyWrittenLogs.shift()
        }
    }

    private static tagsToString(tags: TagSet[]): string {
        return tags.map((tag) => {
            return `${tag.key.white().reset()}: ${tag.value.green().reset()}`
        }).join(", ")
    }

    public static log(message: any, loggerOptions?: LoggerOptions): void {
        if (this._pathToLogsFolder === "") {
            this.print(`You need to set a path to logs folder with ${"setPathToLogsFolder()".yellow().reset()}. Message not saved: ${this.convertAnyToString(message).cyan()}`, {
                level: Level.Error,
                tagSets: [{key: "Type", value: "Logger"}]
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
        
        return Logger.resetString(rainbowText)
    }

    private static getLevel(level: Level): string {
        switch (level) {
            case Level.Information:
                return `${Style.Reset}${BackgroundColor.Green}${ForegroundColor.Black} ${level} ${Style.Reset}`
            case Level.Warning:
                return `${Style.Reset}${BackgroundColor.Yellow}${ForegroundColor.Black} ${level} ${Style.Reset}`
            case Level.Error:
                return `${Style.Reset}${BackgroundColor.Red}${ForegroundColor.White} ${level} ${Style.Reset}`
            case Level.Fatal:
                return `${Style.Reset}${BackgroundColor.Magenta}${ForegroundColor.White} ${level} ${Style.Reset}`
            case Level.Debug:
                return `${Style.Reset}${BackgroundColor.Blue}${ForegroundColor.White} ${level} ${Style.Reset}`
            case Level.Default:
                return Logger.resetString("")
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

    private static writeToInfluxDbFile() {
        let tempArr = this._logsToBeWrittenArr.slice()
        this._logsToBeWrittenArr = []

        fs.mkdir(`${this._pathToLogsFolder}logs/`, {recursive: true}, () => {
            let path = `${this._pathToLogsFolder}logs/from_${this.getDateForFileName(tempArr[0].getTimestamp())}_to_${this.getDateForFileName(tempArr[tempArr.length - 1].getTimestamp())}.log.gz`
            
            let influxDbProtocolLines = ""

            for (let i = 0; i < tempArr.length; i++) {
                influxDbProtocolLines += tempArr[i].getInfluxDbLineProtocol() + "\n"
            }
            
            GZip.compress(influxDbProtocolLines, path)
        })
    }

    public static saveToFileBeforeClosing() {
        if (this._logsToBeWrittenArr.length === 0) return

        this.writeToInfluxDbFile()
    }

    private static getDateForFileName(timestamp: string | number) {
        let date = new Date(timestamp)
        return date.toISOString()
    }
}
