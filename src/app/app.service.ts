import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  solucionaExemplo(): string {
    return 'Exemplo usando service';
  }
}
