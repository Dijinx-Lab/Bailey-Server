import express from "express";
import cors from "cors";
import routes from "./routes/routes_routes.mjs";
import quesRoutes from "./routes/questions_routes.mjs";
import chalRoutes from "./routes/challenges_routes.mjs";
import teamRoutes from "./routes/team_routes.mjs";
import answerRoutes from "./routes/answers_routes.mjs";
import utilRoutes from "./routes/util_routes.mjs";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);
app.use("/api/v1", quesRoutes);
app.use("/api/v1", chalRoutes);
app.use("/api/v1", teamRoutes);
app.use("/api/v1", answerRoutes);
app.use("/api/v1", utilRoutes);

app.use("*", (req, res) => res.status(404).json({ Error: "Not Found" }));

export default app;
