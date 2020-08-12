import { Publisher, TicketCreatedEvent, Subjects } from "@surajng/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject : Subjects.TicketCreated = Subjects.TicketCreated;
}