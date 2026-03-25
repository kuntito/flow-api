import "./envConfig"; // validates environment variables
import express, { Express } from "express";
import flowRouter from "./routes/flowRoutes";

const app: Express = express();
const PORT = process.env.PORT || 5003;

// allows project to parse JSON in request body
app.use(express.json());

app.use("/api/flow", flowRouter);

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});