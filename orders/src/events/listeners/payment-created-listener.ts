import { Subjects, PaymentCreatedEvent, Listener, OrderStatus } from "@surajng/common";
import { Message } from "node-nats-streaming";

import { queueGroupName } from "./queue-group-name";
import { Order } from '../../models/orders';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  // order service keeps track of all tickets to its local ticket collection 
  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    // id field passes same value from ticket serv to order serv
    const order = await Order.findById( data.orderId );
    if(!order){
      throw new Error('Order not found');
    };
    
    order.set({
      status: OrderStatus.Complete
    })
    
    await order.save();
    
    msg.ack();
  }
}
