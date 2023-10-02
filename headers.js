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
        channel.assertExchange('headers_exchange', 'headers', { durable: false });
        //Create queue if it isn't exist. Else ignore it
        channel.assertQueue('QDeveloper', { durable: false });
        channel.assertQueue('QManager', { durable: false });
        channel.assertQueue('QPublished', { durable: false });
        //Bind to queue
        let opts = { 'dev': 'Developer Channel', 'general': 'General Channel', 'x-match': 'any' };
        channel.bindQueue('QDeveloper', 'headers_exchange','', opts);

        opts = { 'dev': 'Developer Channel', 'general': 'General Channel', 'manager': 'Manager Channel', 'x-match': 'any' };
        channel.bindQueue('QManager', 'headers_exchange','', opts);

        opts = { 'dev': 'Developer Channel', 'access': 'publish', 'x-match': 'all' };
        channel.bindQueue('QPublished', 'headers_exchange','', opts);

        channelGlobal = channel;
    })
    .catch((error) => {
        console.error('Error connecting to RabbitMQ', error);
    });
app.post('/messageHeaders', (req, res) => {
    // Publish the message to RabbitMQ
    let opts;

    //any
    opts = { headers: { 'dev': 'Developer Channel' }};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Developer1'), opts)

    opts = { headers: { 'general': 'General Channel' }};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Developer2'), opts);

    opts = { headers: { 'dev': 'Developer Channel', 'general': 'General Channel' }};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Developer3'), opts);

    //any
    opts = { headers: { 'dev': 'Developer Channel'}};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Manager1'), opts);

    opts = { headers: { 'general': 'General Channel'}};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Manager2'), opts);

    opts = { headers: { 'manager': 'Manager Channel'}};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Manager3'), opts);

    opts = { headers: { 'dev': 'Developer Channel', 'general': 'General Channel', 'manager': 'Manager Channel'}};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Manager4'), opts);

    //and
    opts = { headers: { 'dev': 'Developer Channel'}};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Publish1'), opts);

    opts = { headers: { 'access': 'publish'}};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Publish2'), opts);

    opts = { headers: { 'dev': 'Developer Channel', 'access': 'publish'}};
    channelGlobal.publish('headers_exchange', '', Buffer.from('This is message from Publish3'), opts);

    res.sendStatus(200);
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/consumerManualHeaders', (req, res) => {
    // Consume messages from RabbitMQ
    channelGlobal.consume('QDeveloper', (message) => {
        console.log("QDeveloper " + message.content.toString());
    }, { noAck: true });
    channelGlobal.consume('QManager', (message) => {
        console.log("QManager " + message.content.toString());
    }, { noAck: true });
    channelGlobal.consume('QPublished', (message) => {
        console.log("QPublished " + message.content.toString());
    }, { noAck: true });
    res.sendStatus(200);
});

io.on('connection', socket => {
});
server.listen(3003, () => {
    console.log('Server listening on port 3003');
})