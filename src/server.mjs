import express from "express";
import cors from "cors";
import userRoutes from "./routes/user_routes.mjs";
import photoRoutes from "./routes/photo_routes.mjs";
import printRoutes from "./routes/prints_routes.mjs";
import writingRoutes from "./routes/writings_routes.mjs";
import uploadRoutes from "./routes/upload_routes.mjs";
import sessionRoutes from "./routes/session_routes.mjs";
import commonsRoutes from "./routes/commons_route.mjs";

const app = express();

app.use(cors());
app.use(express.json());

const baseUrl = "/api/v1/bailey";

app.use(baseUrl, userRoutes);
app.use(baseUrl, uploadRoutes);
app.use(baseUrl, photoRoutes);
app.use(baseUrl, printRoutes);
app.use(baseUrl, writingRoutes);
app.use(baseUrl, sessionRoutes);
app.use(baseUrl, commonsRoutes);

app.use("*", (req, res) =>
  res.status(404).json({
    success: false,
    data: {
      status: 404,
      error: "Not Found",
      url: req.baseUrl,
      method: req.method,
    },
    message:
      "The request made can not reach the server because either the URI is incorrect or the resource have been moved to another place. Please contact the system administrator for more information",
  })
);

export default app;
