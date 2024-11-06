import { RegexProcol } from "./regex.protocol";

export class RemoveSpacesRegex implements RegexProcol {
    execute(str: string): string {
        return str.replace(/\s+/g, '');
    }
}