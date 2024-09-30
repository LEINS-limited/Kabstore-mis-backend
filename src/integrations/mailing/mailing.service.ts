import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from 'src/entities/user.entity';
import { footerHTML, headerHTML } from 'src/utils/appData/constants';

@Injectable()
export class MailingService {
  private transporter;
  private options;
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(link: string, reset: boolean, user: any) {
    try {
      if (!reset) {
        if (user instanceof User) {
          this.options = {
            from: 'info@kabstore.rw',
            to: user.email,
            subject: 'Rwanda Coding Academy Email verification',
            html: `${headerHTML}
                
          <h1>Email Verification</h1>
          </div>
          <div class='content'>
            <p>Hello ${user.lastName}
            <p>Your account as student at Kabstore has been created successfully! Please click the button below to verify your email address</p>
            <p>Please head to the portal and use ${user.password} as your default password</p>
            <p>Your verification code is  ${user.activationCode}</p>
            <p> You can also verify your account by click on this link <a class='button' href='${link}'>Verify Email</a>
          </div>
            ${footerHTML}  
            `,
          };
        }
      } else {
        this.options = {
          from: 'info@kabstore.rw',
          to: user.email,
          subject: 'Rwanda Coding Academy Email verification',
          html: `${headerHTML}
              
        <h1>Email Verification</h1>
        </div>
        <div class='content'>
          <p>Hello ${user.lastName}
          <p>Thank you for signing up! Please click the button below to reset  your password :</p>
          <p>Your verification code is  ${user.activationCode}</p>
          <p> You can also verify your account by click on this link <a class='button' href='${link}'>Reset your password</a>
        </div>
          ${footerHTML}  
          `,
        };
      }
      await this.transporter.sendEmail(this.options);
    } catch (error) {
      console.log(error);
    }
  }
  async sendNotificationEmail(
    to: string,
    name: string,
    message: string,
    link: string,
  ) {}
}
