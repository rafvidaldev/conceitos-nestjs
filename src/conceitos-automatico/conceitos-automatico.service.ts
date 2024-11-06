import { Injectable } from '@nestjs/common';

@Injectable()
export class ConceitosAutomaticoService {
  getHome() {
    return 'conceitos automático via service';
  }
}
