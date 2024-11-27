import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouters from "./routers/index.js";

const app = express()
app.use(express.json())
app.use(cors())
dotenv.config({
    path: ".env"
})

app.all("*", function(req, res, next) {
    res.contentType("application/json");
    res.header("X-Powered-By", "Express.js");
    console.log('request:', req.method, req.url, req.body);
    next();
});

app.use("/", apiRouters)

app.listen(process.env.PORT || 9000, async () => {
    console.log(`server started! Port: http://localhost:${process.env.PORT}`)
})
