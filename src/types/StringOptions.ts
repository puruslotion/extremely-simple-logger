import { Style } from "util";
import { BackgroundColor } from "../enums/BackgroundColor";
import { ForegroundColor } from "../enums/ForegroundColor";

export type StringOptions = {
    backgroundColor?: BackgroundColor,
    foregroundColor?: ForegroundColor,
    style?: Style
}