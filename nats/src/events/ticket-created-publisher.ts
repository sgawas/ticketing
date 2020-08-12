import { Publisher, TicketCreatedEvent, Subjects } from "@surajng/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;   
}