import { Controller, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigType } from '@nestjs/config';
import globalConfig from 'src/global-config/global.config';

@Controller('home')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(globalConfig.KEY)
    private readonly globalConfiguration: ConfigType<typeof globalConfig>
  ) {
    console.log(globalConfiguration)
  }

  //@Get('hello')
  getHello(): string {
    return 'qualquer coisa';
    //return this.appService.getHello();
  }

  //@Get('exemplo')
  exemplo() {
    return this.appService.solucionaExemplo();
  }
}
