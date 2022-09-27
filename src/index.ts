// imports
import path from "path";
import { Logger } from "./classes/Logger"
import { Level } from "./enums/Level";

// exports
export { Logger } from "./classes/Logger"
export { BackgroundColor } from "./enums/BackgroundColor"
export { ForegroundColor } from "./enums/ForegroundColor"
export { Level } from "./enums/Level"

const serverPort = 4000;
const webSocketServerPort = 8080

Logger.init({
    pathToLogs: path.join(__dirname, "logs"),
    maxNumberOfLinesInPreviouslyWrittenLogsArray: 1000,
    maxNumberOfLinesPerInfluxProtocolFile: 5000,
    title: "Test"
})

Logger.initServers(serverPort, webSocketServerPort)

let counter = 0
setInterval(() => {
    for (let i = 0; i < 2; i++) {
        Logger.print("Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world", {
            level: Level.Information,
            tagSets: [
                {key: "Protocol", value: "MQTT"}, 
                {key: "Operation", value: "Publish"}
            ],
            fieldSets: [
                {key: "OxygenPercent", value: Math.random() * 200},
                {key: "Status", value: Boolean(Math.round(Math.random()))},
                {key: "test", value: "Hello"}
            ]
        })

        Logger.log("Hello world", {
            level: Level.Information,
            tagSets: [
                {key: "Protocol", value: "MQTT"}, 
                {key: "Operation", value: "Publish"}
            ],
            fieldSets: [
                {key: "OxygenPercent", value: Math.random() * 200},
                {key: "Status", value: Boolean(Math.round(Math.random()))},
                {key: "test", value: "Hello"}
            ]
        })

        // Logger.saveToFileBeforeClosing()

        ++counter
    }
}, 5000)

process.on("SIGINT", async () => {
    console.log("SIGINT")
    await Logger.saveCurrentLogsToFile()
    process.exit()
})

process.on("SIGTERM", async () => {
    console.log("SIGTERM")
    await Logger.saveCurrentLogsToFile()
    process.exit()

})
