import { IsEmail, IsNotEmpty } from "class-validator";

export class NotificationDto{
    @IsNotEmpty()
    @IsEmail()
    email:string;
}