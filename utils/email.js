const nodemailer=require("nodemailer");
const {EMAIL_HOST,EMAIL_PASSWORD,EMAIL_USERNAME,EMAIL_PORT}=require("../config/secure");

const sendEmail=async(option)=>{

    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"javascript97559755@gmail.com",
            pass:"djouzqurelrhbocb"
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