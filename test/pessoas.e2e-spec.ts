import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule, ConfigType } from '@nestjs/config';
import globalConfig from 'src/global-config/global.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { RecadosModule } from 'src/recados/recados.module';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { AuthModule } from 'src/auth/auth.module';
import * as path from 'path';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int.id.pipe';
import appConfig from 'src/app/app.config';
import { CreatePessoaDto } from 'src/pessoas/dto/create-pessoa.dto';

const login = async (
  app: INestApplication,
  email: string,
  password: string
) => {
  const response = await request(app.getHttpServer())
    .post('/auth')
    .send({email, password});

  return response.body.accessToken
}

const createUserAndLogin = async (app: INestApplication) => {
  const nome = 'Any User';
  const email = 'anyuser@email.com';
  const password = '123456';

  await request(app.getHttpServer()).post('/pessoas').send({
    nome,
    email,
    password
  });

  return login(app, email, password);
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(globalConfig),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            database: 'nestjs_testing', //ATENÇÃO
            password: '1234',
            autoLoadEntities: true,
            synchronize: true,
            dropSchema: true
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
    }).compile();

    app = module.createNestApplication();

    appConfig(app);

    await app.init();

    accessToken = await createUserAndLogin(app);
  });

  afterEach(async () => {
    await app.close();
  })

  describe('/pessoas (POST)', () => {
    it('deve criar uma pessoa com sucesso', async () => {
      const createPessoaDto: CreatePessoaDto = {
        email: 'rafael@email.com',
        password: '1233456',
        nome: 'Rafael'
      }
      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        email: createPessoaDto.email,
        nome: createPessoaDto.nome,
        passwordHash: expect.any(String),
        active: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        picture: '',
        id: expect.any(Number)
      });
    });

    it('deve gerar um erro de email já cadastrado', async () => {
      const createPessoaDto: CreatePessoaDto = {
        email: 'rafael@email.com',
        nome: 'Rafael',
        password: '123456'
      }

      await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toBe('E-mail já cadastrado.');
    });

    it('deve gerar um erro de senha curta', async () => {
      const createPessoaDto: CreatePessoaDto = {
        email: 'rafael@email.com',
        nome: 'Rafael',
        password: '123'
      }

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(['password must be longer than or equal to 5 characters']);
      expect(response.body.message).toContain('password must be longer than or equal to 5 characters');
    });
  });

  describe('/pessoas (GET)', () => {
    const createPessoaDto: CreatePessoaDto = {
      email: 'rafael@email.com',
      password: '1233456',
      nome: 'Rafael'
    }

    it('deve retornar UNAUTHORIZED quando usuário não está logado', async () => {
      const pessoaResponse = await request(app.getHttpServer())
      .post('/pessoas')
      .send(createPessoaDto)
      .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
      .get(`/pessoas/${pessoaResponse.body.id}`)
      .expect(HttpStatus.UNAUTHORIZED);
    });

    it('deve retornar Pessoa quando usuário está logado', async () => {
      const pessoaResponse = await request(app.getHttpServer())
      .post('/pessoas')
      .send(createPessoaDto)
      .expect(HttpStatus.CREATED);

      //const accessToken = await createUserAndLogin(app);

      const response = await request(app.getHttpServer())
      .get(`/pessoas/${pessoaResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        email: createPessoaDto.email,
        nome: createPessoaDto.nome,
        passwordHash: expect.any(String),
        active: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        picture: '',
        id: expect.any(Number)
      })
    });
  });
});
