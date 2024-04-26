import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IMail } from './interfaces/mail.interfaces';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(options: IMail) {
    const { to, subject, content, token } = options;

    try {
      await this.mailerService.sendMail({
        to: to,
        subject: subject, // Subject line
        template: content === 'token' ? './token' : './token', // Select template by content
        context: {
          token: token,
        },
      });
      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  }
}
