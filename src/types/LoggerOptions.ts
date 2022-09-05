import { BackgroundColor } from "../enums/BackgroundColor";
import { ForegroundColor } from "../enums/ForegroundColor";
import { Level } from "../enums/Level";
import { Style } from "../enums/Style";

export type LoggerOptions = {
    timestampForegroundColor?: ForegroundColor,
    timestampBackgroundColor?: BackgroundColor,
    timestampStyle?: Style,
    level?: Level,
    timestamp?: string,
    tag?: string[]
}
