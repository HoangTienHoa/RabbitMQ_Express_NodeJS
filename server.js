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
        channel.assertExchange('direct_exchange', 'direct', { durable: false });
        channel.assertQueue('chat_messages', { durable: false });
        channel.bindQueue('chat_messages', 'direct_exchange', 'chat');
        channelGlobal = channel;
    })
    .catch((error) => {
        console.error('Error connecting to RabbitMQ', error);
    });
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.post('/message', (req, res) => {
    const message = req.query.message;
    // Publish the message to RabbitMQ
    channelGlobal.publish('direct_exchange', 'chat', Buffer.from(message));
    res.sendStatus(200);
});
app.get('/consumerManual', (req, res) => {
    // Consume messages from RabbitMQ
    channelGlobal.consume('chat_messages', (message) => {
        console.log(message.content.toString());
    }, { noAck: true });
    res.sendStatus(200);
});

io.on('connection', socket => {
    console.log('User connected. Socket Id ' + socket.id);

    // Consume messages from RabbitMQ
    channelGlobal.consume('chat_messages', (message) => {
        socket.broadcast.emit('new_message', message.content.toString());
    }, { noAck: true });

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', reason => {
        console.log('Disconnect: ' + socket.id + '. Reason '+ reason);
    })
});
server.listen(3000, () => {
    console.log('Server listening on port 3000');
})