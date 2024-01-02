import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";

const produce = async() => 
{
    const kafka = new Kafka(
    {
        clientId: "test-app",
        brokers: ["redpanda0:9092"],
        requestTimeout: 25000,
        connectionTimeout: 3000,
    });

    const producer = kafka.producer();
    await producer.connect();

    let movie_data;
    let path = "video/video.mp4";
    //let index = 0;

    const readStream = fs.createReadStream(path, {highWaterMark: 512*1024});
    readStream.on("data", (chunk) => 
    {
        producer.send(
            {
                topic: "test-streaming",
                messages: 
                [
                    {
                        value: chunk,
                        key: String(1),
                    }
                ],
            });
        //index++;
    });
    
    readStream.on("end", () =>
    {
        producer.disconnect();
    });
}

export default produce;