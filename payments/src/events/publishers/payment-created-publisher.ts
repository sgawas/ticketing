import { Publisher, PaymentCreatedEvent, Subjects } from "@surajng/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}