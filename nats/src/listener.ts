import nats, { Message } from 'node-nats-streaming';

console.clear();
const stan = nats.connect('ticketing', '123', {
    url: 'http://localhost:4222'
})

stan.on('connect', ()=>{
    console.log('listening to Nats');

    const subscription = stan.subscribe('ticket:created');

    subscription.on('message', (msg: Message)=>{
        const data = msg.getData();

        console.log(`Received message#: ${msg.getSequence()} with data: ${data}`);
    })
})