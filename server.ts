import "./envConfig"; // validates environment variables
import express, { Express } from "express";
import flowRouter from "./routes/flowRoutes";
import cors from 'cors';

const app: Express = express();
const PORT = process.env.PORT || 5003;

// allows project to parse JSON in request body
app.use(express.json());

// any one can access API routes
app.use(cors());
// for specific origins, use:
// `
// app.use(
//     cors({
//         origin: [
//             'http://localhost:5173',
//             'https://myapp.com'
//         ]
//     })
// );
// `

app.use("/api/flow", flowRouter);

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});