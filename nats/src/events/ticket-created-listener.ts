import { Message } from 'node-nats-streaming';

import { Listener, TicketCreatedEvent, Subjects } from '@surajng/common';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName= 'payments-service';
    onMessage(data: TicketCreatedEvent['data'], msg: Message ){
        console.log('inside message:', data);
        console.log(data.id);
        console.log(data.title);
        console.log(data.price);
        console.log(data.userId);
        msg.ack();
    }
}