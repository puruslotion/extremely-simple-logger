import path from "path"
import { Logger } from "./classes/Logger"
import { Level } from "./enums/Level"

// exports
export { Logger } from "./classes/Logger"
export { BackgroundColor } from "./enums/BackgroundColor"
export { ForegroundColor } from "./enums/ForegroundColor"
export { Level } from "./enums/Level"

Logger.init({
    title: "Example",
    pathToLogs: path.join(__dirname, "logs"),
    maxNumberOfLinesPerInfluxProtocolFile: 5
})

Logger.initServers(3000, 8080)

for (let i = 0; i < 10; i++) {
    Logger.print("Hello world", {
    level: Level.Information,
    tagSets: [{
            key: "Protocol", 
            value: "MQTT"
        }],
    fieldSets: [{
            key: "Temperature", 
            value: (Math.random() * 80) - 35
        }]
    })
}

for (let i = 0; i < 10; i++) {
    Logger.log("Hello world", {
    level: Level.Information,
    tagSets: [{
            key: "Protocol", 
            value: "MQTT"
        }],
    fieldSets: [{
            key: "Temperature", 
            value: (Math.random() * 80) - 35
        }]
    })
}

