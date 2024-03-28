import express from "express";
import cors from "cors";
import routes from "./routes/routes_routes.mjs";
import quesRoutes from "./routes/questions_routes.mjs"
import chalRoutes from "./routes/challenges_routes.mjs"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);
app.use("/api/v1", quesRoutes);
app.use("/api/v1", chalRoutes);

app.use("*", (req, res) => res.status(404).json({ Error: "Not Found" }));

export default app;
