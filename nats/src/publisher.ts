import nats from 'node-nats-streaming';

import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();
const stan = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
})

stan.on('connect', async ()=>{
    console.log('connected to Nats');

    const publisher =  new TicketCreatedPublisher(stan);
    try{ 
        await publisher.publish({
            id: '123',
            title: 'adadad',
            price: 23,
            userId: '12sdasd'
        });
    } catch(err){
        console.error(err);
    }
    
    // const data = JSON.stringify({
    //     id: '123',
    //     title: 'concert',
    //     price: 20
    // })

    // stan.publish('ticket:created', data, ()=>{
    //     console.log('event pubslished');
    // })
})