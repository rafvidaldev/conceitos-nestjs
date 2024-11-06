import { Injectable } from "@nestjs/common";

@Injectable()
export class RecadosUtils {
    inverteSetring(str: string) {
        return str.split('').reverse().join('');
    }
}

@Injectable()
export class RecadosUtilsMock {
    inverteSetring() {
        return 'bla';
    }
}