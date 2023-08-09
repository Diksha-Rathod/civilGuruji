const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secureConnection: false, // TLS requires secureConnection to be false
  auth: {
    user: "89032b674ebb4c",
    pass: "187974402d7b07"
  },
})
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