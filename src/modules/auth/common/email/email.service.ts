import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const tmp_email = 'tmp_email';
const tmp_password = 'tmp_password';

@Injectable()
class EmailService {
  public readonly Transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    this.Transporter = createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: tmp_email,
        pass: tmp_password,
      },
    });
  }

  public async sendActivationMail(options: { to: string; link: string }): Promise<void> {
    await this.Transporter.sendMail({
      from: tmp_email,
      to: options.to,
      subject: 'Account activation ringfence',
      html: `
			<div> 
				<h1>For activation go to link</h1>
				<a href="${options.link}">${options.link}</a>
			</div> 
			`,
    });
  }

  public async SendRecoveryMail(options: { to: string; link: string }): Promise<void> {
    await this.Transporter.sendMail({
      from: tmp_email,
      to: options.to,
      subject: 'Recovery password ringfence',
      html: `
			<div> 
				<h1>For recovery password go to link</h1>
				<a href="${options.link}">${options.link}</a>
			</div> 
			`,
    });
  }
}
export { EmailService };
