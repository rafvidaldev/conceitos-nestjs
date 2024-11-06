import { registerAs } from "@nestjs/config";

export default registerAs('globalConfig', () => ({
    database: {
        type: process.env.DATABASE_TYPE as 'mysql',
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT,
        username: process.env.DATABASE_USERNAME,
        database: process.env.DATABASE_DATABASE,
        password: process.env.DATABASE_PASSWORD,
        autoLoadEntities: Boolean(process.env.DATABASE_AUTOLOADENTITIES), //Carrega entidades sem necessidade de especifica-las,
        synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE) //Sincroniza tudo com o BD. Não deve ser usado em produção
    },
    environment: process.env.NODE_ENV || 'development',
}));