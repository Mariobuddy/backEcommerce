require('dotenv').config();


const {PORT,SECURE,TOKEN,EMAIL_USERNAME,EMAIL_HOST,EMAIL_PORT,EMAIL_PASSWORD,Cloud_Name,Cloud_Key,Cloud_Secret}=process.env;


module.exports={PORT,SECURE,TOKEN,EMAIL_HOST,EMAIL_PASSWORD,EMAIL_PORT,EMAIL_USERNAME,Cloud_Key,Cloud_Name,Cloud_Secret}