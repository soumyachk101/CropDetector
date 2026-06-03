import app from './server';
import { env } from './config/env';

const port = env.PORT;

app.listen(port, () => {
  console.log(`🚀 Crop Detector API Gateway is running on port ${port}`);
  console.log(`🔌 Connecting to database...`);
});
