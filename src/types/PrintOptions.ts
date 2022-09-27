import { BackgroundColor } from "../enums/BackgroundColor";
import { ForegroundColor } from "../enums/ForegroundColor";
import { Level } from "../enums/Level";
import { Style } from "../enums/Style";
import { FieldSet } from "./FieldSet";
import { TagSet } from "./TagSet";

export type PrintOptions = {
    timestampForegroundColor?: ForegroundColor,
    timestampBackgroundColor?: BackgroundColor,
    timestampStyle?: Style,
    level?: Level,
    timestamp?: string,
    tagSets?: TagSet[],
    tagForegroundColor?: ForegroundColor,
    tagBackgroundColor?: BackgroundColor
    tagStyle?: Style
    fieldSets?: FieldSet[]
}
