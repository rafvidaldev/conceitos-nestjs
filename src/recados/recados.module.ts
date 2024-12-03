import { forwardRef, Module } from '@nestjs/common';
import { RecadosController } from './recados.controller';
import { RecadosService } from './recados.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recado } from './entities/recado.entity';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { RecadosUtils, RecadosUtilsMock } from './recados.utils';
import { RegexFactory } from 'src/common/regex/regex.factory';
import { RemoveSpacesRegex } from 'src/common/regex/remove-spaces.regex';
import { ONLY_LOWERCASE_LETTERS_REGEX, REMOVE_SPACES_REGEX } from './recados.constants';
import { MyDynamicModule } from 'src/my-dynamic/my-dynamic.module';
import { ConfigModule } from '@nestjs/config';
import recadosConfig from './recados.config';
import { EmailModule } from 'src/email/email.module';
// import { ONLY_LOWERCASE_LETTERS_REGEX, REMOVE_SPACES_REGEX, SERVER_NAME } from 'src/recados/recados.constants';
// import { RegexProcol } from 'src/common/regex/regex.protocol';
// import { RemoveSpacesRegex } from 'src/common/regex/remove-spaces.regex';
// import { OnlyLowercaseLettersRegex } from 'src/common/regex/only-lowercase-letters.regex';

@Module({
  imports: [
    ConfigModule.forFeature(recadosConfig),
    TypeOrmModule.forFeature([Recado]), 
    forwardRef(() => PessoasModule),
    EmailModule
    // MyDynamicModule.register({
    //   apiKey: 'API KEY',
    //   apiUrl: 'https://blablabla'
    // })
  ],
  controllers: [
    RecadosController
  ],
  providers: [
    RecadosService,
    RegexFactory,
    // {
    //   provide: REMOVE_SPACES_REGEX, //token
    //   useFactory: (regexFactory: RegexFactory) => {
    //     //Meu código
    //     return regexFactory.create('RemoveSpacesRegex');
    //   },
    //   inject: [RegexFactory] //Injetando na factory na ordem
    // },
    // {
    //   provide: ONLY_LOWERCASE_LETTERS_REGEX, //token
    //   useFactory: async (regexFactory: RegexFactory) => {
    //     //Espera alguma coisa acontecer
    //     console.log('Vou aguardar a promise abaixo ser resolvida');
    //     await new Promise(resolve => setTimeout(resolve, 3000));
    //     console.log('Promise resolvida');

    //     //Meu código
    //     return regexFactory.create('OnlyLowercaseLettersRegex');
    //   },
    //   inject: [RegexFactory] //Injetando na factory na ordem
    // },
    {
      provide: RecadosUtils, //Token
      useClass: RecadosUtils,
      //useValue: new RecadosUtilsMock() //Valor a ser usado
    },
    // {
    //   provide: SERVER_NAME,
    //   useValue: 'My name is NestJS'
    // },
    // {
    //   provide: ONLY_LOWERCASE_LETTERS_REGEX,
    //   useClass: OnlyLowercaseLettersRegex
    // },
    // {
    //   provide: REMOVE_SPACES_REGEX,
    //   useClass: RemoveSpacesRegex
    // }
  ],
  exports: [
    RecadosUtils, 
    //SERVER_NAME
  ]
})
export class RecadosModule {}
