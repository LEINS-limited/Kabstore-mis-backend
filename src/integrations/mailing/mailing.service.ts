import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { footerHTML, headerHTML } from 'src/utils/appData/constants';

@Injectable()
export class MailingService {
  private options;
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
  ) {}

  async sendEmail(link: string, reset: boolean, user: any) {
    const recipient = await user;
    try {
      if (reset) {
        this.options = {
          transporterName: null,
          to: recipient.email,
          subject: 'Password Reset - Kabstore',
          html: `${headerHTML}
            </div>
            <div class='content'>
              <p>Hello ${recipient.lastName},</p>
              <p>We received a request to reset your password.</p>
              <p>Your verification code:</p>
              <div class='code-box'>${recipient.activationCode}</div>
              <p><a class='button' href='${link}'>Reset Password</a></p>
              <p>If you didn't request this, you can ignore this email.</p>
            </div>
            ${footerHTML}`,
        };
      } else {
        this.options = {
          transporterName: null,
          to: recipient.email,
          subject: 'Verify Your Email - Kabstore',
          html: `${headerHTML}
            </div>
            <div class='content'>
              <p>Hello ${recipient.lastName},</p>
              <p>Welcome to Kabstore. Please verify your email to get started.</p>
              <p>Your verification code:</p>
              <div class='code-box'>${recipient.activationCode}</div>
              <p><a class='button' href='${link}'>Verify Email</a></p>
            </div>
            ${footerHTML}`,
        };
      }
      await this.mailService.sendMail(this.options);
    } catch (error) {
      console.log(error);
    }
  }
  async sendResetPasswordToke(link: string, reset: boolean, password : string, user: any) {
    const recipient = await user;
    try {
      if (reset) {
        this.options = {
          transporterName: null,
          to: recipient.email,
          subject: 'Temporary Password - Kabstore',
          html: `${headerHTML}
            </div>
            <div class='content'>
              <p>Hello ${recipient.lastName},</p>
              <p>Your temporary password has been generated.</p>
              <p>Temporary password:</p>
              <div class='code-box'>${password}</div>
              <p><a class='button' href='${link}'>Login Now</a></p>
              <p>Please change your password after logging in.</p>
            </div>
            ${footerHTML}`,
        };
      } else {
        this.options = {
          transporterName: null,
          to: recipient.email,

          subject: 'Verify Your Email - Kabstore',
          html: `${headerHTML}
            </div>
            <div class='content'>
            
              <p>Hello ${recipient.lastName},</p>
              <p>Welcome to Kabstore. Please verify your email to get started.</p>
              <p>Your verification code:</p>
              <div class='code-box'>${recipient.activationCode}</div>
              <p><a class='button' href='${link}'>Verify Email</a></p>
            </div>
            ${footerHTML}`,
        };
      }
      await this.mailService.sendMail(this.options);
    } catch (error) {
      console.log(error);
    }
  }
  
}
