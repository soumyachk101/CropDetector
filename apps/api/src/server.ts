import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/v1', routes);

// Base route for health checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Express API Gateway' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Server Error:', err.message || err);
  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
});

export default app;
