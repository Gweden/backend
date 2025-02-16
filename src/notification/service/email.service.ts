import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from "nodemailer";
import { AppConfigService } from 'src/common/config/config';
import { INotification } from '../interface/notification.interface';
import { INotificationPayload } from '../interface';


@Injectable()
export class EmailService implements INotification{
    private readonly logger = new Logger(EmailService.name);
    private readonly transporter: nodemailer.transporter;
    private readonly mailConfig:any;
    private readonly subject = "OTP Verification";

    constructor(
        private readonly config:AppConfigService
    ){
        this.mailConfig = this.config.getMailConfig();
        this.transporter = nodemailer.createTransport({
            host:this.mailConfig.host,
            port:+this.mailConfig.port,
            secure:this.mailConfig.secure,
            auth:{
                user:this.mailConfig.username,
                pass:this.mailConfig.password
            },
            tls:{
                rejectUnauthorized:false
            }
        });
    }

    async notify(payload:INotificationPayload):Promise<boolean>{
        await this.transporter.sendMail({
            from:this.mailConfig.from,
            to:payload.recipient,
            subject:this.subject,
            text:payload.message,
            html:`<p>${payload.message}<p>`
        });
        this.logger.debug(`Email sent to ${payload.recipient}`);
        return true;
    }
    
}
