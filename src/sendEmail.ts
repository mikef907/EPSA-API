'use strict';
import nodemailer from 'nodemailer';
import { GmailAppPW } from './config';

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (to: string, msg: string, subject: string) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'admin@epsaak.org',
      pass: GmailAppPW,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    to, // list of receivers
    subject, // Subject line
    from: 'EPSA',
    html: msg,
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

export default sendEmail;
