import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IMail } from './interfaces/mail.interfaces';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(options: IMail) {
    const { to, subject, content } = options;

    try {
      await this.mailerService.sendMail({
        to: to,
        from: process.env.MAIL_SENDER, // sender address
        subject: subject, // Subject line
        html: content,
      });
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }
}
