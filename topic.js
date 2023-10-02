const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const amqp = require("amqplib");
let channelGlobal;
amqp.connect('amqp://localhost')
    .then((connection) => connection.createChannel())
    .then((channel) => {
        console.log("Connection Message Broker");
        //Create exchange if it isn't exist. Else, ignore it.
        channel.assertExchange('topic_exchange', 'topic', { durable: false });
        //Create queue if it isn't exist. Else ignore it
        channel.assertQueue('topic_queue1', { durable: false });
        channel.assertQueue('topic_queue2', { durable: false });
        channel.assertQueue('topic_queue3', { durable: false });
        //Bind to queue
        channel.bindQueue('topic_queue1', 'topic_exchange', '*.orange.*');
        channel.bindQueue('topic_queue2', 'topic_exchange', '*.*.rabbit');
        channel.bindQueue('topic_queue3', 'topic_exchange', 'lazy.#');
        channelGlobal = channel;
    })
    .catch((error) => {
        console.error('Error connecting to RabbitMQ', error);
    });
app.post('/messageTopic', (req, res) => {
    //const message = req.query.message;
    // Publish the message to RabbitMQ
    channelGlobal.publish('topic_exchange', 'quick.orange.rabbit', Buffer.from('quick.orange.rabbit'));
    channelGlobal.publish('topic_exchange', 'lazy.orange.elephant', Buffer.from('lazy.orange.elephant'));
    channelGlobal.publish('topic_exchange', 'quick.orange.fox', Buffer.from('quick.orange.fox'));
    channelGlobal.publish('topic_exchange', 'lazy.brown.fox', Buffer.from('lazy.brown.fox'));
    channelGlobal.publish('topic_exchange', 'lazy.pink.rabbit', Buffer.from('lazy.pink.rabbit'));
    channelGlobal.publish('topic_exchange', 'orange', Buffer.from('orange'));
    channelGlobal.publish('topic_exchange', 'quick.orange.new.rabbit', Buffer.from('quick.orange.new.rabbit'));
    channelGlobal.publish('topic_exchange', 'lazy.orange.new.rabbit', Buffer.from('lazy.orange.new.rabbit'));
    res.sendStatus(200);
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/consumerManualTopic', (req, res) => {
    // Consume messages from RabbitMQ
    channelGlobal.consume('topic_queue1', (message) => {
        console.log("topic_queue1 " + message.content.toString());
    }, { noAck: true });
    channelGlobal.consume('topic_queue2', (message) => {
        console.log("topic_queue2 " + message.content.toString());
    }, { noAck: true });
    channelGlobal.consume('topic_queue3', (message) => {
        console.log("topic_queue3 " + message.content.toString());
    }, { noAck: true });
    res.sendStatus(200);
});

io.on('connection', socket => {
});
server.listen(3002, () => {
    console.log('Server listening on port 3002');
})