import express from "express";
import path from "path";
import produce from "./producer.js";
import consume from "./consumer.js";
import fs from "fs";
import EventEmitter from "events";
import { ReadableStreamBuffer } from "stream-buffers";
import { Server } from "socket.io";
import Http from "http";
import PriorityQueue from "./priority_queue.js";

const app = express();
const port = 4000;
const server = Http.createServer(app);
const io = new Server(server);

const eventEmitter = new EventEmitter();

var current = 0;
var mes = [];

const pq = new PriorityQueue();

function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
  }
  function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
  }
  


io.on('connection', (socket) => {
    console.log("A client has connected.");
/*
    eventEmitter.on("dataAdded", () =>
    {
        const newFrame = pq.dequeue();
        console.log(newFrame.key);
        socket.emit("videoFrame", newFrame.message);
    });*/

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });



/*app.get("/streaming", async (req, res) => 
{
    console.log("streaming");
    const range = req.headers.range;

    let readStream = new Stream.PassThrough();

    const objs = mes;
    objs.sort((a, b) => 
        JSON.parse(a.key) > JSON.parse(b.key)
        ? 1 
        : JSON.parse(b.key) > JSON.parse(a.key)
        ? -1
        : 0
    );

    const buf_array = objs.map((b) => b.value)[current];
    if(!buf_array)
    {
        return res.end();
    }

    const buf = Buffer.from(buf_array);

    current++;

    const start = 0;
    const end = buf.length;
    const size = end - start;
    const head = 
    {
        "Access-Control-Allow-Origin": "*",
        "Content-Range": `bytes ${start}-${end}/17839845`,
        "Accept-Ranges": "bytes",
        "Content-Length": size,
        "Content-Type": "video/mp4",
    };
    var myReadableStreamBuffer = new ReadableStreamBuffer(
    {
        frequency: 10,
        chunkSize: 2,
    });
    res.writeHead(206, head);
    readStream.end(buf);
    readStream.pipe(res);
});


app.get("/file_streaming", (req, res) =>
{
    const path = "video/video.mp4";
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    let start;
    let end;
    if(range)
    {
        const parts = range.replace(/bytes=/, "").split("-");
        start = parseInt(parts[0], 10);
        end = parts[1] ? parseInt(parts[1], 10) : fileSize -1;
    }
    else
    {
        start = 0;
        end = 1;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, {start, end});
    const head = 
    {
        "Access-Control-Allow-Origin": "*",
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",    
    };
    res.writeHead(206, head);
    file.pipe(res);
});*/


app.get("/produce", async (req, res) =>
{
    produce();/*
    cons.run(
    {
        eachMessage: async ({topic, partition, message}) =>
        {
            console.log(
            {
                value: message.value,
            });
            const new_message = Object.assign({}, message);
            const new_message_key = JSON.parse(message.key.toString());
            req;
            const start = 0;
            const end = message.value.length;
            const chunksize = end - start + 1;
            mes.push(new_message);
        }
    });*/
    res.setHeader("Content-type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send({ message: "producing" });  
});

app.get("/", async function (req, res)
{
    res.sendFile(path.resolve("html/index.html"));
    const id = generateRandomString(5);
    const consumer = await consume(id);
    console.log("I consume");
    await sleep(4000);
    consumer.run(
    {
        eachMessage: async ({topic, partition, message}) =>
        {
            const frame = message.value;
            //pq.enqueue({key: parseInt(message.key.toString()), message: message.value});
            //console.log(message.value.toString());
            //console.log(message.key.toString());
            //const newFrame = pq.dequeue();
            //console.log(newFrame.key);
            io.emit("videoFrame", frame);
            //eventEmitter.emit("dataAdded");
        }
    });
});

server.listen(4000, () =>
{
    console.log("Socket on port 4000");
});
  
  