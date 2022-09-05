import {Logger} from "./classes/Logger"
import { BackgroundColor } from "./enums/BackgroundColor"
import { ForegroundColor } from "./enums/ForegroundColor"
import { Style } from "./enums/Style"
import { Level } from "./enums/Level"

Logger.Print({text: "Hello world", style: Style.Bright})
Logger.Print({text: "Hello world", style: Style.Underscore})
Logger.Print({text: "Hello world", style: Style.Dim})
Logger.Print({text: "Hello world", style: Style.Reverse})

Logger.Log({level: Level.Information, text: "Hello"})
Logger.Log({level: Level.Warning, text: "Hello"})
Logger.Log({level: Level.Error, text: "Hello"})
Logger.Log({timestamp: new Date().toTimeString(),
            level: Level.Error, text: Logger.ColorString({
                text: "Hello world", 
                foregroundColor: ForegroundColor.Cyan
            })
        })
Logger.Log({timestamp: new Date().toTimeString(), level: Level.Error, text: Logger.ColorString({text: "Hello world", foregroundColor: ForegroundColor.Cyan, style: Style.Underscore})})
console.log(Logger.RainbowString("Hello world. How are you doing today? Ok, that is mighty fine! See you later!"))
//Logger.Print("Hello world", )

//console.log("Hello from Typescript!!")
//console.log(Logger.ColorString("Hello", ForegroundColor.Red))
//console.log("Hello")
//Logger.Print("Hello", ForegroundColor.Blue, BackgroundColor.Yellow)
//Logger.Print("Hello", ForegroundColor.Green, BackgroundColor.White, Style.Reverse)
//Logger.Print("Hello", undefined, undefined, Style.Underscore)