import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { EmailService } from './email.service';
import { INotification, NotificationType } from '../interface';


@Injectable()
export class NotificationFactory{
    private readonly logger = new Logger(NotificationFactory.name);
    constructor(
        private readonly emailService:EmailService
    ){}

    getNotificationService(notificationType:NotificationType):INotification{
        switch(notificationType){
            case NotificationType.EMAIL:
                return this.emailService;
            default:
                this.logger.warn(`Unknown notification type: ${notificationType}`);
                throw new NotImplementedException(`Unknown notification type: ${notificationType}`);
        }
    }
    
}
