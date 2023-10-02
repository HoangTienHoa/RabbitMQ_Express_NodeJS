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
        channel.assertExchange('direct_exchange', 'direct', { durable: false });
        //Create queue if it isn't exist. Else ignore it
        channel.assertQueue('chat_messages', { durable: false });
        //Bind to queue
        channel.bindQueue('chat_messages', 'direct_exchange', 'chat');
        channelGlobal = channel;
    })
    .catch((error) => {
        console.error('Error connecting to RabbitMQ', error);
    });
app.post('/message', (req, res) => {
    const message = req.query.message;
    // Publish the message to Exchange
    channelGlobal.publish('direct_exchange', 'chat', Buffer.from(message));
    //Send Message to one queue only
    //channelGlobal.sendToQueue('chat_messages', Buffer.from(message));
    res.sendStatus(200);
})
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
;
app.get('/consumerManual', (req, res) => {
    //This tells RabbitMQ not to give more than one message to a worker at a time
    //channelGlobal.prefetch(1);

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