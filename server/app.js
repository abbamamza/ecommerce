/* 
================== Most Important ==================
* Issue 1: Folders (public/uploads/products, customize, categories) 
  are created automatically on server start
* Issue 2: Admin signup → role: 1  |  Customer → role: 0 (default)
*/

const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import Routers
const authRouter = require("./routes/auth");
const categoryRouter = require("./routes/categories");
const productRouter = require("./routes/products");
const brainTreeRouter = require("./routes/braintree");
const orderRouter = require("./routes/orders");
const usersRouter = require("./routes/users");
const customizeRouter = require("./routes/customize");

// Middleware & Helpers
const { loginCheck } = require("./middleware/auth");
const CreateAllFolder = require("./config/uploadFolderCreateScript");

// Create upload folders if they don't exist
CreateAllFolder();

// MongoDB Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("============== MongoDB Connected Successfully =============="))
  .catch((err) => {
    console.log("Database Connection Failed !!!", err);
    process.exit(1); // Exit if DB fails — Render will show clear error
  });

// Middlewares
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api", authRouter);
app.use("/api/user", usersRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api", brainTreeRouter);
app.use("/api/order", orderRouter);
app.use("/api/customize", customizeRouter);

// Health check route (helps Render detect the service is alive)
app.get("/", (req, res) => {
  res.send("Hayroo E-commerce API is running!");
});

// ====================== RENDER-OPTIMIZED SERVER START ======================
// This exact pattern guarantees Render detects the port in < 5 seconds
const PORT = process.env.PORT || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is LIVE on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
  if (process.env.PORT) {
    console.log("Render assigned port detected:", process.env.PORT);
  }
});

// Extra safety — some platforms need this
module.exports = app;