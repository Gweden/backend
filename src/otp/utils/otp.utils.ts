export class OtpUtils{
    static generateOtp(otpLength:number):string{
        const otp = Math.floor(Math.random() * Math.pow(10, otpLength)).toString().padStart(otpLength, '0');
        return otp;
    }
}