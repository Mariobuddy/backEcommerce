const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("cloudinary");
const fileUpload=require("express-fileupload");
const { PORT, SECURE,Cloud_Key,Cloud_Name,Cloud_Secret } = require("./config/secure");
const routes = require("./router/route");
const routes1 = require("./router/route1");
const routes2 = require("./router/routes2");
const routes3=require("./router/route3");
const connection = require("./database/connection");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cookieParser());
cloudinary.config({
  cloud_name: Cloud_Name,
  api_key: Cloud_Key,
  api_secret: Cloud_Secret,
});
app.use(
  cors({
    credentials: true,
    methods: "GET,POST,PATCH,DELETE,OPTIONS",
    optionsSuccessStatus: 200,
    origin: "https://rohit-backend-ecommerce.onrender.com",
  })
);

app.use("/api", routes);
app.use(routes1);
app.use(routes2);
app.use(routes3);

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
    return error;
  }
};

Start();
