import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, UnauthorizedException } from "@nestjs/common";

@Catch(HttpException)
export class MyExceptionFilter<T extends HttpException> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse();
        const request = context.getRequest();

        const statusCode = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const error = typeof response === 'string' ? {
            messaage: exceptionResponse
        } : (exceptionResponse as object);

        response.status(statusCode).send({
            ...error,
            data: new Date().toISOString(),
            path: request.url
        });
    }
}