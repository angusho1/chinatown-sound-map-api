import { Request, Response, NextFunction } from 'express';

async function getSubmissions(req: Request, res: Response, next: NextFunction) {
    res.send('Submissions');
}

async function postSubmissions(req: Request, res: Response) {
    console.log(req.body);
    res.send({ message: 'success' });
}

export default { getSubmissions, postSubmissions };