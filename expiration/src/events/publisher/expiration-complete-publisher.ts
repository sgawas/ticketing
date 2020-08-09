import {Subjects, Publisher, ExpirationCompleteEvent} from '@surajng/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}