import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRoutes from './routes/index.route';
import usersRoutes from './routes/users.route';
import soundClipsRoutes from './routes/sound-clips.route';
import submissionsRoutes from './routes/submissions.route';
import authRoutes from './routes/auth.route';
import errorHandler from './middleware/error.middleware';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRoutes);
app.use(usersRoutes);
app.use(soundClipsRoutes);
app.use(submissionsRoutes);
app.use(authRoutes);
app.use(errorHandler);

export default app;
module.exports = app;