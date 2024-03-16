import cors from 'cors';

const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN,
    optionsSuccessStatus: 200,
};

export default cors(corsOptions);
