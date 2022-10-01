import { FieldSet } from "../types/FieldSet"
import { TagSet } from "../types/TagSet"
import { Logger } from "./Logger"

export class LogData {
    private _timestamp: string | number
    private _level: string
    private _tagSets: TagSet[]
    private _message: string
    private _fieldSets: FieldSet[]
    private _measurementName: string

    constructor(timestamp: string | number, level: string, message: string, measurementName?: string, tagSets?: TagSet[], fieldSets?: FieldSet[]) {
        this._timestamp = timestamp
        this._level = level
        this._tagSets = tagSets ?? []
        this._fieldSets = fieldSets ?? []

        if (level) {
            this._tagSets.push({key: "Level", value: level})
        }

        this._fieldSets.push({key: "Message", value: message})
        this._message = message
        this._measurementName = measurementName ?? "Logger"
    }

    public getTimestamp(): string | number {
        return this._timestamp
    }

    public getLevel(): string {
        return this._level
    }

    public getTagSets(): TagSet[] {
        return this._tagSets
    }

    public getMessage() {
        return this._message
    }

    public getFieldSets() {
        return this._fieldSets
    }

    public getMeasurementName() {
        return this._measurementName
    }

    private getMeasurementNameForInfluxDb(): string {
        return this._measurementName.replace(/,/gi, "\\,").replace(/ /gi, "\\ ")
    }

    private getTagSetsForInfluxDb(): string {
        return this._tagSets.map((tagSet: TagSet) => {
            return `${tagSet.key.replace(/,/gi, ",\\").replace(/=/gi, "\\=").replace(/ /gi, "\\ ")}=${tagSet.value.replace(/,/gi, ",\\").replace(/=/gi, "\\=").replace(/ /gi, "\\ ")}`
        }).join(",")
    }

    private getFieldSetsForInfluxDb(): string {
        return this._fieldSets.map((fieldSet: FieldSet) => {
            if (typeof fieldSet.value === "string") {
                return `${fieldSet.key.replace(/,/gi, ",\\").replace(/=/gi, "\\=").replace(/ /gi, "\\ ")}="${fieldSet.value.replace(/"/gi, "\\\"").replace(/\\/gi, "\\\\")}"`
            } else if (typeof fieldSet.value === "boolean" || typeof fieldSet.value === "number") {
                return `${fieldSet.key.replace(/,/gi, ",\\").replace(/=/gi, "\\=").replace(/ /gi, "\\ ")}=${fieldSet.value}`
            }

            return ""
        }).join(",")
    }

    private getTimestampForInfluxDb(): number {
        if (typeof this._timestamp === "number") {
            return this._timestamp * 1000000
        }

        return new Date(this._timestamp).getTime() * 1000000
    }

    public convertToJsonStringified(): string {
        return `${JSON.stringify({
            Timestamp: this._timestamp,
            Level: this._level,
            TagSets: this._tagSets,
            Message: Logger.convertAnyToString(this._message),
            FieldSets: this._fieldSets,
            MeasurementName: this._measurementName
        })}\n`
    }

    public getInfluxDbLineProtocol() {
        return `${this.getMeasurementNameForInfluxDb()},${this.getTagSetsForInfluxDb()} ${this.getFieldSetsForInfluxDb()} ${this.getTimestampForInfluxDb()}`
    }
}
