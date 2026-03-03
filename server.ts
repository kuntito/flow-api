import express, { Express } from "express";

const app: Express = express();
const PORT = 5003; // TODO ensure PORT doesn't clash with other projects

// allows project to parse JSON in request body
app.use(express.json());

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})