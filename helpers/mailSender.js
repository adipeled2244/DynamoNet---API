const nodemailer = require('nodemailer');
require('dotenv').config();

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const sendgrid = require('@sendgrid/mail');

const sendMailFromDynamoNet = async (sendTo) => {

    console.log(process.env.SENDGRID_API_KEY)
    
    // sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
    sendgrid.setApiKey(process.env.NOY_PASS)

    const msg = {
       to: 'adipeled224@gmail.com',
     // Change to your recipient
       from: 'dynamonet2023@gmail.com',
     // Change to your verified sender
       subject: 'Sending with SendGrid Is Fun',
       text: 'and easy to do anywhere, even with Node.js',
       html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sendgrid
       .send(msg)
       .then((resp) => {
         console.log('Email sent\n', resp)
       })
       .catch((error) => {
         console.error(error)
     })
}
// const createTransporter = async () => {
//     const oauth2Client = new OAuth2(
//         process.env.CLIENT_ID,
//         process.env.CLIENT_SECRET,
//         "https://developers.google.com/oauthplayground"
//     );

//     // oauth2Client.setCredentials({
//     //     refresh_token: process.env.REFRESH_TOKEN
//     // });

//     let accessToken;
//     try {
//         accessToken = await oauth2Client.getAccessToken();
//         console.log(accessToken)
//     }catch(err){
//         console.log('error', err);
//     }
    
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             type: "OAuth2",
//             user: process.env.EMAIL,
//             accessToken,
//             clientId: process.env.CLIENT_ID,
//             clientSecret: process.env.CLIENT_SECRET,
//             // refreshToken: process.env.REFRESH_TOKEN
//         }
//     });

//     return transporter;
// };

// const sendEmail = async (emailOptions) => {
//     let emailTransporter = await createTransporter();
//     await emailTransporter.sendMail(emailOptions);
//   };
  
//   await sendEmail({
//     subject: "Test",
//     text: "I am sending an email from nodemailer!",
//     to: sendTo,
//     from: process.env.EMAIL
//   });
// }
// // Create a transporter object to send emails

// console.log('hiiiiiiiiii',process.env.USER_MAIL,
//     'pass:', process.env.USER_PASS);
// const transporter = nodemailer.createTransport({
//     type: "OAuth2",
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.USER_MAIL,
//       pass: process.env.USER_PASS
//     }
//   });


//   // Define the email message
//   const mailOptions = {
//     from: process.env.USER_MAIL,
//     to: mailTo,
//     subject: 'Hey, Data is ready ! ',
//     text: 'link'
//   };

//   // Send the email
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });


module.exports = { sendMailFromDynamoNet }

