import express from "express";
import { router } from "./routes/v1";
import { config } from "./config";

const app = express();

app.use(express.json());

app.use("/api/v1", router);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});
