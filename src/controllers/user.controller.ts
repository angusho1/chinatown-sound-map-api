import { Request, Response, NextFunction } from 'express';

async function getUsers(req: Request, res: Response, next: NextFunction) {
    res.send('Get some users');
}

export default { getUsers }