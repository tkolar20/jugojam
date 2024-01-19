import { Kafka } from "kafkajs";
import fs from "fs";

const produce = async (videoId: string) => 
{
    const kafka = new Kafka(
        {
            clientId: "producer" + videoId,
            brokers: ["redpanda0:9092"],
            requestTimeout: 25000,
            connectionTimeout: 3000,
        });

    const producer = kafka.producer();
    await producer.connect();

    const admin = kafka.admin();
    await admin.connect();
    if(!await admin.createTopics({ waitForLeaders: true, topics: [{ topic: `video${videoId}` }] }))
    {
        return;
    }

    let path = `video/video${videoId}.mp4`;


    const readStream = fs.createReadStream(path, { highWaterMark: 512 * 1024 });
    readStream.on("data", (chunk) => 
    {
        producer.send(
            {
                topic: `video${videoId}`,
                messages:
                    [
                        {
                            value: chunk,
                            key: String(1),
                        }
                    ],
            });
    });

    readStream.on("end", () =>
    {
        producer.disconnect();
    });
}

export default produce;