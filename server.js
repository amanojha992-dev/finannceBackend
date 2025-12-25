import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import portfolioRoute from "./routes/portfolio.route.js";
import stockRoute from "./routes/stock.route.js";


dotenv.config();

const allowedOrigins = [
  "https://finannce-frontend.vercel.app",

  "http://localhost:3000",
];




const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
     
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


app.use("/api/stocks", stockRoute);     
app.use("/api/portfolio", portfolioRoute); 

// ---------------- Server ----------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
