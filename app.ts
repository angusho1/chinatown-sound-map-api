import express, { RequestHandler } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport';

import indexRoutes from './src/routes/index.route';
import userRoutes from './src/routes/user.route';
import soundClipRoutes from './src/routes/sound-clip.route';
import soundRecordingRoutes from './src/routes/sound-recording.route';
import submissionRoutes from './src/routes/submission.route';
import authRoutes from './src/routes/auth.route';
import errorHandler from './src/middleware/error.middleware';

const app = express();

app.use(logger('dev'));
app.use(express.json() as RequestHandler);
app.use(express.urlencoded({ extended: false }) as RequestHandler);
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'src/public')));

app.use(indexRoutes);
app.use(userRoutes);
app.use(soundClipRoutes);
app.use(soundRecordingRoutes);
app.use(submissionRoutes);
app.use(authRoutes);
app.use(errorHandler);

export default app;
module.exports = app;