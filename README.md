# RabbitMQ_Express_NodeJS
A chat application using RabbitMQ, Express and NodeJS

# Run
    npm i

    Test case 1:
        node publisher.js
        node consumer.js
    Test direct
        node direct.js
    Test fanout
        node fanout.js
    Test Topic
        node topic.js
    Test Headers
        node headers.js
    Test Priority Queue
        node priorityQueue.js
    Note: Read the code and use postman to create Request

# Technical Note

Declare an exchange
````
const exchangeName = 'direct_message';
const exchangeType = 'direct';
channel.assertExchange(exchangeName, exchangeType, { durable: false });
````

Declare a queue
````
const queueName = 'myQueue';
await channel.assertQueue(queueName, { durable: false });

In this code, we declare a durable queue named ‘myQueue’.
Durable:
    false: this queue will delete after server restart
    true: this queue still exist after server restart
````

Publish messages to the exchange, exchange bind message to queue then send message.
````
const message = 'Hello World!';
channel.publish(queueName, routingKey, Buffer.from(message));
--> Must to define exchange
````

Publish messages to the queue
````
const message = 'Hello World!';
channel.sendToQueue(queueName, Buffer.from(message));
--> Mustn't to define exchange
````

Publish messages to the queue with expire time
````
const message = 'Hello World!';
const options = { expiration: '10000' };
channel.sendToQueue(queueName, Buffer.from(message), options);
--> Mustn't to define exchange

In this code, we set the expiration option to 10000 milliseconds (10 seconds), which means that the message will be automatically deleted from the queue 
after 10 seconds if it has not been consumed.
````

Consume messages from the queue
````
const queueName = 'myQueue';
const consumeOptions = { noAck: true };
channel.consume(queueName, (message) => {
console.log(`Received message: ${message.content.toString()}`);
}, consumeOptions);

The noAck option is set to true, which means that RabbitMQ will automatically acknowledge the receipt of the message.
````

Acknowledge the receipt of the message
````
const queueName = 'myQueue';
const consumeOptions = { noAck: false };
channel.consume(queueName, (message) => {
  console.log(`Received message: ${message.content.toString()}`);
  channel.ack(message);
}, consumeOptions);

In this code, we set the noAck option to false, which means that we need to manually acknowledge the receipt of the message using the channel.ack() method. 
Inside the callback function, we call the channel.ack() method to acknowledge the receipt of the message after processing it.
````

Limit Queue
````
Auto expire : Time message is expire
Message TTL : Time message live
Overflow behaviour: What happent when queue is over? We have 2 cases to handler it:
+ drop-head (By default) aka  remove oldest message
+ reject-publish Reject new message to queue
````

Advanded RabbitMQ
````
+ Have priority Queue
+ Once Message get ack flag, message will remove from queue. Can not re-run message.
+ It has advanced routing mechanisms
````

# Ref
    https://voskan.host/2023/03/07/integrating-node-js-with-rabbitmq-message-queues/
    https://www.rabbitmq.com/tutorials/tutorial-six-javascript.html

    Config Cluster
        https://voskan.host/2023/05/15/rabbitmq-cluster-node-js-application/
         

