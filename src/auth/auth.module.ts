import { Global, Module } from "@nestjs/common";
import { HashingService } from "./hashing/hashing.service";
import { BcryptService } from "./hashing/bcrypt.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pessoa } from "src/pessoas/entities/pessoa.entity";
import { ConfigModule } from "@nestjs/config";
import jwtConfig from "./config/jwt.config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthTokenGuard } from "./guards/auth-token.guard";
import { RoutePoliceGuard } from "./guards/route-police.guard";

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Pessoa]),
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync(jwtConfig.asProvider())
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: HashingService,
            useClass: BcryptService
        },
        AuthService,
        //AuthTokenGuard,
        //RoutePoliceGuard
    ],
    exports: [
        HashingService, 
        JwtModule, 
        ConfigModule, 
        TypeOrmModule, 
        //AuthTokenGuard,
        //RoutePoliceGuard
    ]
})
export class AuthModule {}