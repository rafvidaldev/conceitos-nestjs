import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, of, tap } from "rxjs";

@Injectable()
export class ChangeDataInterceptor implements NestInterceptor {
    private readonly cache = new Map();

    async intercept(context: ExecutionContext, next: CallHandler<any>) {
        console.log('ChangeDataInterceptor executado antes');

        return next.handle().pipe(
            map(data => {
                if(Array.isArray(data)){
                    return {
                        data,
                        count: data.length
                    }
                }
            })
        );
    }
}