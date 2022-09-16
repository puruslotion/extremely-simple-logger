// imports
import { Logger } from "./classes/Logger"
import { Level } from "./enums/Level"
import http from 'http'
import fs from 'fs'
import { WebSocketServer } from 'ws';

// exports
export { Logger } from "./classes/Logger"
export { BackgroundColor } from "./enums/BackgroundColor"
export { ForegroundColor } from "./enums/ForegroundColor"
export { Level } from "./enums/Level"

// createServer
http.createServer((req, res) => {
    if (req.url === "/") {
        req.url = "/index.html"
    }

    fs.readFile(__dirname + req.url, function (err,data) {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }

        if (req?.url?.includes("index.html")) {
            res.writeHead(200,{
                'Content-Type': 'text/html'
            });
        } else if (req?.url?.includes("front.js")) {
            res.writeHead(200,{
                'Content-Type': 'text/javascript'
            });
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({error: "File not available"}))
            return
        }
        
        res.end(data);
      });
}).listen(4000)

// creating WebSocketServer
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
    Logger.getPreviouslyWrittenLogs().forEach((message: string) => {
        ws.send(message)
    })
});

Logger.setWebSocketServer(wss)

Logger.setPathToLogsFolder("/Users/frodi/Documents/GitHub/extremely-simple-logger")
let counter = 0
setInterval(() => {
    for (let i = 0; i < 1; i++) {
        Logger.print("Hello world", {
            level: Level.Information,
            tagSets: [
                {key: "Protocol", value: "MQTT"}, 
                {key: "Operation", value: "Publish"}
            ],
            fieldSet: [
                {key: "Test", value: false},
                {key: "Counter", value: counter},
                {key: "Test3", value: "Hello"}
            ]
        })

        ++counter
    }
}, 1000)
