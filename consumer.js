const rabbit = require('amqplib');
const QUEUE_NAME = 'square';
connection = rabbit.connect('amqp://localhost');
connection.then(async (conn)=>{
    console.log("Consumer is ready.");
    const channel = await conn.createChannel();
    channel.consume(QUEUE_NAME, (m)=>{
        const number = parseInt(m.content.toString());
        const square = number * number;
        console.log(square);
        channel.ack(m);
    })
})