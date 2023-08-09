const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secureConnection: false,
  auth: {
    user: "59780562572235",
    pass: "515e4d7eac903d"
  }
});
const mail = (email, subject, message) => {
  console.log(email,subject,message)
  var mailOptions = {
    from: "civilGuruji@gmail.com",
    to: email,
    subject: subject,
    html: message,
  };

  transport.sendMail(mailOptions, function (error, info) {
    if (error) console.log(error);
    return info;
  });
};

module.exports = mail;