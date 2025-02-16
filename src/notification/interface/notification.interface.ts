import { INotificationPayload } from "./notification-payload.interface";

export interface INotification {
    notify(payload:INotificationPayload):Promise<boolean>
}