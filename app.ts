import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRoutes from './routes/index.route';
import userRoutes from './routes/user.route';
import soundClipRoutes from './routes/sound-clip.route';
import submissionRoutes from './routes/submission.route';
import authRoutes from './routes/auth.route';
import errorHandler from './middleware/error.middleware';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRoutes);
app.use(userRoutes);
app.use(soundClipRoutes);
app.use(submissionRoutes);
app.use(authRoutes);
app.use(errorHandler);

export default app;
module.exports = app;