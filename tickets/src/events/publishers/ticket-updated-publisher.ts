import { Publisher, TicketUpdatedEvent, Subjects } from '@surajng/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}