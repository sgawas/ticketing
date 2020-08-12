import { Message } from "node-nats-streaming";

import { Listener, OrderCreatedEvent, Subjects } from "@surajng/common";

import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";


export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage (data: OrderCreatedEvent["data"], msg: Message){
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log("waiting this many milliseconds to process the job:", delay);
        // add job to expiration queue with orderId
        await expirationQueue.add({
            orderId: data.id
        },{
            delay
        }
        );
        msg.ack();
    }
}