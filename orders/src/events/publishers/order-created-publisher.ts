import { Publisher, OrderCreatedEvent, Subjects } from '@surajng/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}