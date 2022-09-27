import { Level, Logger } from ".."

Logger.init({
    pathToLogs: __dirname,
    maxNumberOfLinesInPreviouslyWrittenLogsArray: 1000,
    maxNumberOfLinesPerInfluxProtocolFile: 5000,
    title: "Test"
})

let counter = 0
setInterval(() => {
    for (let i = 0; i < 2; i++) {
        Logger.print("Hello world", {
            level: Level.Information,
            tagSets: [
                {key: "Protocol", value: "MQTT"}, 
                {key: "Operation", value: "Publish"}
            ],
            fieldSets: [
                {key: "Test", value: false},
                {key: "Counter", value: counter},
                {key: "Test3", value: "Hello"}
            ]
        })

        Logger.log("Hello world", {
            level: Level.Information,
            tagSets: [
                {key: "Protocol", value: "MQTT"}, 
                {key: "Operation", value: "Publish"}
            ],
            fieldSets: [
                {key: "Test", value: false},
                {key: "Counter", value: counter},
                {key: "Test3", value: "Hello"}
            ]
        })

        ++counter
    }
}, 10000)

process.on("SIGINT", () => {
    Logger.saveCurrentLogsToFile()
})

process.on("SIGTERM", () => {
    Logger.saveCurrentLogsToFile()
})
