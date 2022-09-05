export { Logger } from "./classes/Logger"
export { BackgroundColor } from "./enums/BackgroundColor"
export { ForegroundColor } from "./enums/ForegroundColor"
export { Level } from "./enums/Level"

import {Logger} from "./classes/Logger"
import { Level } from "./enums/Level"

Logger.print("Hello world", {
    level: Level.Information,
    tag: ["Hello", "World"]
})

Logger.log("Hello world")

Logger.destroy()
