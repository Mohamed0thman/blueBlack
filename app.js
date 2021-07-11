const express = require("express");
var cors = require("cors");

const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");
const categoriesRouter = require("./routers/categories");
const brandsRouter = require("./routers/brands");
const feedbackRouter = require("./routers/feedback");
const optionsRouter = require("./routers/options");
const galleriesRouter = require("./routers/galleries");

const app = express();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("upload"));

app.use(productsRouter);
app.use(usersRouter);
app.use(categoriesRouter);
app.use(brandsRouter);
app.use(feedbackRouter);
app.use(optionsRouter);
app.use(galleriesRouter);

module.exports = app;
