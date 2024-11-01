import express from 'express';
import newsletterRoutes from './routes/newsletterRoutes';

const app = express();
app.use(express.json());

// Use the routes
app.use('/api/v1/newsletters', newsletterRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
