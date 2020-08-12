import { Subjects, OrderCreatedEvent, Listener } from "@surajng/common";
import { Message } from "node-nats-streaming";

import { Order } from "../../models/orders";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  // order service keeps track of all tickets to its local ticket collection 
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // id field passes same value from order serv to payment serv
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();
    msg.ack();
  }
}
