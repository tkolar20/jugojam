import { Kafka } from "kafkajs";
const kafka = new Kafka(
{
    clientId: "test-app",
    brokers: ["redpanda0:9092"],
});

const producer = kafka.producer(
{
    maxInFlightRequests: 1,
    idempotent: true,
    transactionalId: "uniqueProducerId",
});

async function SendPayload(input: string)
{
    try 
    {
        await producer.send(
        {
            topic: "test",
            messages: [{key:"test", value:input}],
        });
    }
    catch(e)
    {
        console.error("Caught error while sending:" + e);
    }
}

await producer.connect();
await SendPayload("Nekaj tam.");