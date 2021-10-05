const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email,
        this.fisrtName = user.name.split(' ')[0],
        this.url = url,
        this.from = `Usama Wazir <${process.env.EMAIL_FROM}>`
    }

    //Create Transport
    newTransport () {
        if(process.env.NODE_ENV === 'production') {
            //Send Grid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    //Send Actual Email
    async send(template, subject) {
        //Render Html Based on PUG Template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            fisrtName: this.fisrtName,
            url: this. url,
            subject
        });

        //Define Email Options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        //Create Transport for tthe email and Send it on this transport
        await this.newTransport().sendMail(mailOptions);
    }

    //Sending Welcome Email
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Faimly');
    }

    //Sending Reset Password Email
    async sendResetPassword() {
        await this.send('resetPassword', 'Your Password Reset Token (Valid for Only 10 mins)');
    }
}