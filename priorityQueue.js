/*
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
        channel.assertExchange('priority_exchange', 'direct', { durable: false, maxPriority: 255 });
        //Create queue if it isn't exist. Else ignore it
        channel.assertQueue('priority_queue', { durable: false });
        //Bind to queue
        channel.bindQueue('priority_queue', 'priority_exchange', 'chat');
        channelGlobal = channel;
    })
    .catch((error) => {
        console.error('Error connecting to RabbitMQ', error);
    });
app.post('/message', (req, res) => {
    const message = req.query.message;
    const priority = parseInt(req.query.priority);
    // Publish the message to Exchange
    channelGlobal.publish('priority_exchange', 'chat', Buffer.from(message),{priority});
    res.sendStatus(200);
})
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
;
app.get('/consumerManual', (req, res) => {
    //This tells RabbitMQ not to give more than one message to a worker at a time
    // Consume messages from RabbitMQ
    channelGlobal.consume('priority_queue', (message) => {
        console.log(message.content.toString());
    }, { noAck: true });
    res.sendStatus(200);
});

io.on('connection', socket => {
});
server.listen(3000, () => {
    console.log('Server listening on port 3000');
})*/
