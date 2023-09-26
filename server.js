const express = require("express");
const app = express();
const cookieParser=require("cookie-parser");
const cors=require("cors");
const { PORT, SECURE } = require("./config/secure");
const routes = require("./router/route");
const routes1=require("./router/route1");
const connection = require("./database/connection");
app.use(express.json({limit: '50mb'}));
app.use(cookieParser());
app.use(cors({
    credentials:true,
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
    optionsSuccessStatus: 200,
    origin: 'http://localhost:3000'
}));

app.use("/api/products", routes);
app.use(routes1);

app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  res.status(error.statusCode).json({
    status: error.status,
    statusCode: error.statusCode,
    message: error.message,
  });
});

const Start = async () => {
  try {
    await connection(SECURE);
    app.listen(PORT, () => {
      console.log(`Server is started on PORT ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    return;
  }
};

Start();
