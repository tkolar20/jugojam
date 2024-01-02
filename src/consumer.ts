import { Kafka } from "kafkajs";

const consume = async (id) =>
{
    const kafka = new Kafka(
    {
        clientId: id,
        brokers: ["redpanda0:9092"],
        requestTimeout: 25000,
        connectionTimeout: 3000,    
    });
    const consumer = kafka.consumer({ groupId: "whatever" });

    await consumer.connect();
    await consumer.subscribe({ topic: "test-streaming", fromBeginning: true });

    return consumer;
};

export default consume;