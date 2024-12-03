import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ParseIntIdPipe } from "src/common/pipes/parse-int.id.pipe";

export default (app: INestApplication) => {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, //remove chaves que não estão no DTO,
            forbidNonWhitelisted: true, //retornar erro quando a chave não estiver no DTO
            transform: false //tenta transformar os tipos de dados de param e DTOs
        }),
        new ParseIntIdPipe()
    );

    return app;
}