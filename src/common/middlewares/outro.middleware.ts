import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

export class OutroMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('OutroMiddleware');

        next();

        console.log('OutroMiddleware FOI');
    }
}