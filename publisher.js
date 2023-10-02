const rabbit = require('amqplib');
const QUEUE_NAME = 'square';
const EXCHANGE_TYPE = 'direct';
const EXCHANGE_NAME = 'main';
const KEY = 'myKey';
const numbers = ['1', '2', '3', '4', '5'];
connection = rabbit.connect('amqp://localhost');
connection.then(async (conn)=>{
    console.log("Publisher is ready.");
    const channel = await conn.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE);
    await channel.assertQueue(QUEUE_NAME);
    channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, KEY);
   /* numbers.forEach((number)=>{
        channel.sendToQueue(QUEUE_NAME, Buffer.from(number));
    })*/

    let objIndex= {
        index:numbers.length-1
    };

    const intervalObj = setInterval(async (objIndex) => {
        channel.sendToQueue(QUEUE_NAME, Buffer.from(numbers[objIndex.index]));
        console.log("Sent message. "+ numbers[objIndex.index]);
        objIndex.index--;
        if(objIndex.index<0) {
            clearInterval(intervalObj);
        }
    }, 1000,objIndex);
})
