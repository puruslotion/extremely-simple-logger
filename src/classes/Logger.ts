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

export class Logger {
    private static _pathToLogsFolder: string = ""
    private static _writeIntervalTimerId?: NodeJS.Timer
    private static _logsToBeWritten = ""
    private static _writingToFileInProgress = false
    private static _initialized = false

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

        logString += `${printOptions?.timestampStyle ?? Style.Default}${printOptions?.timestampBackgroundColor ?? BackgroundColor.Black}${printOptions?.timestampForegroundColor ?? ForegroundColor.Yellow}${printOptions?.timestamp ?? timestamp}${Style.Reset}`

        if (printOptions?.level) {
            logString += `  ${this.getLevel(printOptions.level)}`
        }

        if (printOptions?.tag) {
            logString += `  [ ${Style.Reset}${printOptions?.tagStyle ?? Style.Default}${printOptions?.tagBackgroundColor ?? BackgroundColor.Default}${printOptions?.tagForegroundColor ?? ForegroundColor.Cyan}${printOptions.tag.join(", ")}${Style.Reset} ]`
        }

        logString += `  ${Logger.convertAnyToString(message)}`

        process.stdout.write(`${Logger.resetString(logString)}\n`)
    }

    public static log(message: any, loggerOptions?: LoggerOptions): void {
        if (this._pathToLogsFolder === "") {
            this.print(`You need to set a path to logs folder with ${"setPathToLogsFolder()".yellow().reset()}. Message not saved: ${this.convertAnyToString(message).cyan()}`, {
                level: Level.Error,
                tag: ["Logger"]
            })

            return
        }

        this._logsToBeWritten += new LogData(
            loggerOptions?.timestamp ?? new Date().toISOString(), 
            loggerOptions?.level?.trim() ?? Level.Default, 
            loggerOptions?.tag ?? [],
            this.convertAnyToString(message)
        ).convertToJson()
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

    private static months = [
        "January", 
        "February", 
        "March", 
        "April", 
        "May", 
        "June", 
        "July", 
        "August", 
        "September", 
        "October", 
        "November", 
        "December"
    ]

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

    private static init(): void {
        this.startWriteInterval()
    }

    private static startWriteInterval() {
        if (this._writeIntervalTimerId) return

        this.writeToFile()

        this._writeIntervalTimerId = setInterval(async () => {
            this.writeToFile()
        }, 1000)
    }

    public static destroy(): void {
        clearInterval(this._writeIntervalTimerId)

        Logger.print("Cleared setInterval", {
            level: Level.Information
        })

        while (this._writingToFileInProgress) {}

        if (this._logsToBeWritten !== "") {
            this.writeToFile()

            Logger.print("Wrote remaining logs in memory to file", {
                level: Level.Information
            })
        }

        while (this._writingToFileInProgress) {}

        this.print("Stopped logger", {
            level: Level.Information
        })
    }

    private static writeToFile(): void {
        try {
            if ((!this._logsToBeWritten || !this._pathToLogsFolder) && this._initialized) 
            {
                this._writingToFileInProgress = false

                return
            }

            this._initialized = true
            this._writingToFileInProgress = true

            fs.mkdir(`${this._pathToLogsFolder}logs/`, () => {
                let messages = this._logsToBeWritten
                this._logsToBeWritten = ""
                let logsPath = `${this._pathToLogsFolder}logs/`
                let timestamp = new Date().toISOString()
                let yearPath = `${logsPath}${timestamp.substring(0, 4)}/`
                let monthPath = `${yearPath}${this.months[parseInt(timestamp.substring(5, 7)) - 1]}/`
                let currentDatePath = `${monthPath}${timestamp.substring(0, 10)}.log`

                fs.mkdir(monthPath, {recursive: true}, () => {
                    fs.appendFile(currentDatePath, messages, () => {
                        this._writingToFileInProgress = false
                    })
                })
            })
        } catch (error) {
            this.print(error, {
                level: Level.Error
            })

            this._writingToFileInProgress = false
        }
    }

    public static setPathToLogsFolder(path: string) {
        this._pathToLogsFolder = path

        this.init()
    }
}
