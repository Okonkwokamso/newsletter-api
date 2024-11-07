import express from 'express';
import cors from "cors";
import { requestLogger, apiLimiter } from "./middleware/requestLogger";
import newsletterRoutes from './routes/newsletterRoutes';
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());
app.use(apiLimiter);
app.use(requestLogger);

// Use the routes
app.use('/api/v1/newsletters', newsletterRoutes);

//app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
