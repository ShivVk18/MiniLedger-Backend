import express from "express";
import cors from "cors";
import routers from "./routes/index.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { AuthRequest } from "./middleware/auth.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api',routers)

app.use(errorHandler);

app.get("/api/me", authenticate, (req: AuthRequest, res) => {
    res.json({
        success: true,
        user: req.user
    });
});


app.get("/health", (_req, res) => {

    
    res.json({
        success: true,
        message: "MiniLedger API is running"
    });
});

export default app;