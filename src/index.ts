import express from "express";
import path, { resolve } from "path";
import produce from "./producer.js";
import fs from "fs";
import EventEmitter from "events";
import axios from "axios";
import { Stream } from "stream";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const port = 4000;

const url_query = "http://ksqldb-server:8088/query";
const url_statement = "http://ksqldb-server:8088/ksql";

app.get("/produce/:id", async (req, res) =>
{
    const id = req.params.id;
    produce(id);
    const ksql_request = `CREATE STREAM videodata${id} (value BYTES)
    WITH (kafka_topic='video${id}', value_format='kafka', partitions=1);`;

    console.log(ksql_request);
    const data = {
        ksql: ksql_request,
        streamsProperties: {},
    };

    const headers = {
        'Accept': 'application/vnd.ksql.v1+json',
    };

    axios.post(url_statement, data, { headers })
        .then(response =>
        {
            console.log(response);
        })
        .catch(error =>
        {
            console.error(error);
        });
    res.setHeader("Content-type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send({ message: "producing" });
});


app.get("/", async (req, res) =>
{
    res.sendFile(path.resolve("public/index.html"));
});

app.get("/video/:id", (req, res) =>
{
    const range = req.headers.range;
    const id = req.params.id;
    if(!range)
    {
        res.status(400).end("Requires Range header");
    }

    const headers = {
        'Accept': 'application/vnd.ksql.v1+json',
    };

    const path = `video/video${id}.mp4`;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const CHUNK_SIZE = 512 * 1024;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1;

    console.log(start);
    console.log(end);

    const response_headers =
    {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    const ksql_query = `SELECT * FROM videodata${id};`;
    console.log(ksql_query);
    const data = {
        ksql: ksql_query,
        streamsProperties: {},
    };

    axios.post(url_query, data, { headers })
        .then(response =>
        {
            const allColumns = response.data.reduce((columns, obj) =>
            {
                const objColumns = obj.row ? obj.row.columns : [];
                return columns.concat(objColumns);
            }, []);
            const combinedBuffer = Buffer.concat(allColumns.map(columnValue => Buffer.from(columnValue, 'base64')));
            const trimmedBuffer = combinedBuffer.subarray(start, end + 1);
            var bufferStream = new Stream.PassThrough();
            bufferStream.end(trimmedBuffer);
            res.writeHead(206, response_headers);
            bufferStream.pipe(res);
        })
        .catch(error =>
        {
            console.error(error);
        });
});

app.get("/player/:id", (req, res) =>
{
    const id = req.params.id;
    let html = fs.readFileSync(resolve("public/player.html"), "utf-8");
    let tempHtml = html.replace("const id = 0", `const id = ${id}`);
    let newHtml = tempHtml.replace("/video/x", `/video/${id}`);
    res.contentType("html");
    res.send(newHtml);
});

app.get("/api/videos", (req, res) =>
{
    const path = "video/info.json";
    const info = JSON.parse(fs.readFileSync(path, 'utf-8'));
    res.json(info);
});

app.get("/api/thumbnails/:id", (req, res) =>
{
    const id = req.params.id;
    const path = resolve(`video/video${id}.jpg`);
    res.sendFile(path);
});

app.listen(4000, () =>
{
    console.log("Socket on port 4000");
});

