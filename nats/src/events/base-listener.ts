import {Message, Stan } from 'node-nats-streaming';

import { Subjects } from './subjects';

interface Event {
    subject: Subjects;
    data: any;
}

export abstract class Listener<T extends Event> {
    protected client: Stan;
    abstract subject: T['subject'];
    abstract queueGroupName: string; // allows events to be sent to specific listeners(instance) in that group and to only one listener in that group.
    abstract onMessage(data: T['data'], msg: Message): void;
    protected ackWait = 5 * 1000; 

    constructor( client: Stan){
        this.client = client;
    }

    subscriptionOptions(){
        return this.client.subscriptionOptions()
            .setDeliverAllAvailable() // when subscription obj gets created NATs going to send all events that were create while before subscription was created or while subscription is down.This is not feasible as it will retry all events that have already been processed.
            .setManualAckMode(true) // to manually acknowledge msg otherwise listeners by default loses event in case there is failure at its end. Nat server will continue to retry those msgs until it receives acknowledgement msg.ack(). 
            .setAckWait(this.ackWait) // manually acknowledge the event.
            .setDurableName(this.queueGroupName); // makes services(listener) never miss an event. NATS keeps track of all events with its status(processed or not) for particular durable subscription and makes sure NATS only emits events which are missed while service(listener) was down for processing and does not send already processed events.
    }

    listen(){
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName, // this is used with setDeliverAllAvailable & setDurableName
            this.subscriptionOptions()
        );
        subscription.on('message', (msg: Message)=>{
            console.log(`Message Received: ${this.subject}/${this.queueGroupName}`);
            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg);
        }) 
    }
    
    parseMessage(msg: Message){
        const data = msg.getData();
        return (typeof data === 'string')? JSON.parse(data): JSON.parse(data.toString('utf-8'));
    }
}