import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import cors from 'cors';
import { connectToDatabase } from './db-connection';
import { errorHandler } from './utils/middleware/error-handler';
import routes from './routes';
import { logger } from './utils';

const HOST = process.env.HOST || 'http://localhost';
const PORT = parseInt(process.env.PORT || '4500');

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes);

app.get('/', (req, res) => {
  return res.json({ message: 'Silence is golden!' });
});

app.use(errorHandler);

const startServer = async () => {
  await connectToDatabase();

  const env = process.env.STAGEFINDER_ENV || 'dev';
  const message: string = `🚀 StageFinder is running on ${HOST}:${PORT}`;

  if (env === 'prod') {
    const options = {
      key: fs.readFileSync('/etc/letsencrypt/live/stagefinder.martin.co.ke/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/stagefinder.martin.co.ke/fullchain.pem'),
    };

    https.createServer(options, app).listen(PORT, () => {
      logger.info(`${message} (HTTPS)`);
    });
    return;
  }

  http.createServer(app).listen(PORT, () => {
    logger.info(`${message} (HTTP)`);
  });
};

startServer();
