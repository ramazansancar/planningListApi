import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouters from "./routers/index.js";
import { nowTime } from "./functions/helpers.js";

const app = express()
app.use(express.json())
app.use(cors())
dotenv.config({
    path: ".env"
})

app.all("*", function(req, res, next) {
    res.contentType("application/json");
    res.header("X-Powered-By", "Express.js");
    if(req.url === "/favicon.ico" || req.url === "/healthCheck") {
        next();
        return;
    }
    console.log(`[${nowTime(1)}]`, req.method, req.url, req.body, req.query, req.params, req.headers['user-agent']);
    next();
});

app.use("/", apiRouters)

app.listen(process.env.PORT || 9000, async () => {
    console.log(`server started! Port: http://localhost:${process.env.PORT}`)
})
