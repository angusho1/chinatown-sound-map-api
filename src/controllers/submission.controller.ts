import { Request, Response, NextFunction } from 'express';

async function getSubmissions(req: Request, res: Response, next: NextFunction) {
    res.send('Submissions');
}

export default { getSubmissions }