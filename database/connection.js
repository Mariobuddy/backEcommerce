const mongoose = require('mongoose');

const connection=async(url)=>{
   try {
    console.log("Database is connected");
    return mongoose.connect(url,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
   } catch (error) {
    console.log(error);
    return;
   }
    

}

module.exports=connection;