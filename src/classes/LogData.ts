import { Logger } from "./Logger"

export class LogData {
    private _timestamp: string
    private _level: string
    private _tag: string[]
    private _message: string

    constructor(timestamp: string, level: string, tag: string[], message: string) {
        this._timestamp = timestamp
        this._level = level
        this._tag = tag
        this._message = message
    }

    public getTimestamp(): string {
        return this._timestamp
    }

    public getLevel(): string {
        return this.getLevel()
    }

    public getTag(): string[] {
        return this._tag
    }

    public getMessage() {
        return this._message
    }

    public convertToJson(): string {
        return `${JSON.stringify({
            Timestamp: this._timestamp,
            Level: this._level,
            Tag: this._tag,
            Message: Logger.convertAnyToString(this._message)
        })}\n`
    }
}
