import { Subjects, TicketCreatedEvent, Listener } from "@surajng/common";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/tickets";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  // order service keeps track of all tickets to its local ticket collection 
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    // id field passes same value from ticket serv to order serv
    const { title, price, id } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();
    msg.ack();
  }
}
