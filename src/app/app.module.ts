import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecadosModule } from 'src/recados/recados.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import globalConfig from 'src/global-config/global.config';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { AuthModule } from 'src/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000, //time to live em ms,
        limit: 10, //máximo de requests durante o ttl
        blockDuration: 5000 //tempo de bloqueio
      }
    ]),
    ConfigModule.forFeature(globalConfig),
    // TypeOrmModule.forRoot({
    //   type: process.env.DATABASE_TYPE as 'mysql',
    //   host: process.env.DATABASE_HOST,
    //   port: +process.env.DATABASE_PORT,
    //   username: process.env.DATABASE_USERNAME,
    //   database: process.env.DATABASE_DATABASE,
    //   password: process.env.DATABASE_PASSWORD,
    //   autoLoadEntities: Boolean(process.env.DATABASE_AUTOLOADENTITIES), //Carrega entidades sem necessidade de especifica-las,
    //   synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE) //Sincroniza tudo com o BD. Não deve ser usado em produção
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(globalConfig)],
      inject: [globalConfig.KEY],
      useFactory: async (globalConfigurations: ConfigType<typeof globalConfig>) => {
        return {
          type: globalConfigurations.database.type,
          host:  globalConfigurations.database.host,
          port: globalConfigurations.database.port,
          username: globalConfigurations.database.username,
          database: globalConfigurations.database.database,
          password: globalConfigurations.database.password,
          autoLoadEntities: globalConfigurations.database.autoLoadEntities, //Carrega entidades sem necessidade de especifica-las,
          synchronize: globalConfigurations.database.synchronize //Sincroniza tudo com o BD. Não deve ser usado em produção
        }
      }
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', '..', 'pictures'),
      serveRoot: '/pictures'
    }),
    PessoasModule,
    RecadosModule,
    GlobalConfigModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
    // {
    //   provide: APP_FILTER,
    //   useClass: ErrorExceptionFilter
    // }
  ],
})
export class AppModule {}

// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(SimpleMiddleware).forRoutes({
//       path: '*', 
//       method: RequestMethod.ALL
//     });
//   }
// }
