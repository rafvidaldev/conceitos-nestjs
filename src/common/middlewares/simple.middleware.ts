import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

export class SimpleMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('SimpleMiddleware');

        const authorization = req.headers?.authorization;

        if(authorization){
            req['user'] = {
                nome: 'Rafael',
                sobrenome: 'Vidal',
                role: 'admin'
            };
        }      
        
        res.setHeader('CABECALHO', 'MIDDLEWARE');

        next();

        console.log('SimpleMiddleware FOI');

        res.on('finish', () => {
            console.log('SimpleMiddleware ACABOU');
        });
    }
}