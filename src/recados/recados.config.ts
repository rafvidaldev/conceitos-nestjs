import { registerAs } from "@nestjs/config";

export default registerAs('recados', () => ({
    teste1: 'val1',
    teste2: 'val2'
}));