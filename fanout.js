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
        channel.assertExchange('fanout_exchange', 'fanout', { durable: false });
        //Create queue if it isn't exist. Else ignore it
        channel.assertQueue('chat_messages1', { durable: false });
        channel.assertQueue('chat_messages2', { durable: false });
        channel.assertQueue('chat_messages3', { durable: false });
        //Bind to queue
        channel.bindQueue('chat_messages1', 'fanout_exchange', '');
        channel.bindQueue('chat_messages2', 'fanout_exchange', '');
        channel.bindQueue('chat_messages3', 'fanout_exchange', '');

        channelGlobal = channel;
    })
    .catch((error) => {
        console.error('Error connecting to RabbitMQ', error);
    });
app.post('/messageFanout', (req, res) => {
    const message = req.query.message;
    // Publish the message to RabbitMQ
    channelGlobal.publish('fanout_exchange', '', Buffer.from(message));
    res.sendStatus(200);
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/consumerManualFanout', (req, res) => {
    // Consume messages from RabbitMQ
    channelGlobal.consume('chat_messages1', (message) => {
        console.log(message.content.toString());
    }, { noAck: true });
    res.sendStatus(200);
});

io.on('connection', socket => {
    console.log('User connected. Socket Id ' + socket.id);

    // Consume messages from RabbitMQ
    channelGlobal.consume('chat_messages1', (message) => {
        socket.broadcast.emit('new_message', message.content.toString());
    }, { noAck: true });

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', reason => {
        console.log('Disconnect: ' + socket.id + '. Reason '+ reason);
    })
});
server.listen(3001, () => {
    console.log('Server listening on port 3001');
})