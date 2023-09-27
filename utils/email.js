const nodemailer=require("nodemailer");
const {EMAIL_HOST,EMAIL_PASSWORD,EMAIL_USERNAME,EMAIL_PORT}=require("../config/secure");

const sendEmail=async(option)=>{

    const transporter=nodemailer.createTransport({
        host:EMAIL_HOST,
        port:EMAIL_PORT,
        auth:{
            user:EMAIL_USERNAME,
            pass:EMAIL_PASSWORD
        }
    });

    const emailOptions={
        from:"javascript97559755@gmail.com",
        to:option.email,
        subject:option.subject,
        text:option.message
    }
  await transporter.sendMail(emailOptions);
}

module.exports=sendEmail;