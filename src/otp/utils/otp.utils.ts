export class OtpUtils{
    static generateOtp(otpLength:number):string{
        const otp = Math.floor(Math.random() * Math.pow(10, otpLength)).toString().padStart(otpLength, '0');
        return otp;
    }
    static getListOtpKey(email:string):string {
        return `list_otp:${email}`;
    }
    static getOtpKey(email:string):string {
        return `otp:${email}`;
    }

    static getOtpRequestKey(email:string):string {
        return `otp_request:${email}`;
    }

    static getOtpResendKey(email:string):string {
        return `otp_resend:${email}`;
    }
}