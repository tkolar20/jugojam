import express from "express";
import path from "path";
import produce from "./producer.js";
import fs from "fs";
import EventEmitter from "events";
import PriorityQueue from "./priority_queue.js";
import axios from "axios";
import { Stream } from "stream";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const port = 4000;
//const server = Http.createServer(app);
//const io = new Server(server);

const url_query = 'http://ksqldb-server:8088/query';

const eventEmitter = new EventEmitter();

var current = 0;
var mes = [];

const pq = new PriorityQueue();

/*
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
/*

/*
io.on('connection', (socket) => {
    console.log("A client has connected.");

    eventEmitter.on("dataAdded", () =>
    {
        const newFrame = pq.dequeue();
        console.log(newFrame.key);
        socket.emit("videoFrame", newFrame.message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
*/


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


app.get("/", async (req, res) =>
{
    res.sendFile(path.resolve("public/index.html"));
    /*const id = generateRandomString(5);
    const consumer = await consume(id);
    console.log("I consume");*/
    //await sleep(4000);
    /*consumer.run(
    {
        eachMessage: async ({topic, partition, message}) =>
        {
            const frame = message.value;
            //console.log(message.value.toString());
            //console.log("I consumed a message");
            //pq.enqueue({key: parseInt(message.key.toString()), message: message.value});
            //console.log(message.value.toString());
            //console.log(message.key.toString());
            //const newFrame = pq.dequeue();
            //console.log(newFrame.key);
            //io.emit("videoFrame", frame);
            //eventEmitter.emit("dataAdded");
        }
    });
    consumer.seek({ topic: 'test-streaming', partition: 0, offset: "0" });*/
});

app.get("/video", (req, res) =>
{
    const range = req.headers.range;
    if (!range) {
    res.status(400).end("Requires Range header");
    }

    const headers = {
      'Accept': 'application/vnd.ksql.v1+json',
    };

    const path = "video/video.mp4";
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const CHUNK_SIZE = 512 * 1024;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1;

    console.log(start);
    console.log(end);

    const response_headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };

    const ksql_query = "SELECT * FROM videodates;";
    console.log(ksql_query);
    const data = {
      ksql: ksql_query,
      streamsProperties: {},
    };

    axios.post(url_query, data, { headers })
      .then(response => {
        const allColumns = response.data.reduce((columns, obj) =>
        {
            const objColumns = obj.row ? obj.row.columns : [];
            return columns.concat(objColumns);
        }, []);
        const combinedBuffer = Buffer.concat(allColumns.map(columnValue => Buffer.from(columnValue, 'base64')));
        const trimmedBuffer = combinedBuffer.subarray(start, end+1);
        var bufferStream = new Stream.PassThrough();
        bufferStream.end(trimmedBuffer);
        res.writeHead(206, response_headers);
        bufferStream.pipe(res);
      })
      .catch(error => {
        console.error(error);
      });
});

app.listen(4000, () =>
{
    console.log("Socket on port 4000");
});
  
  