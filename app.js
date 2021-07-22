require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
const productsRouter = require("./routes/products");
const productsMediaRouter = require("./routes/productsMedia");
const productsStockRouter = require("./routes/productsStock");
const personRouter = require("./routes/persons");

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/products", productsRouter);
app.use("/products/media", productsMediaRouter);
app.use("/products/stock", productsStockRouter);
app.use("/persons", personRouter);

module.exports = app;
