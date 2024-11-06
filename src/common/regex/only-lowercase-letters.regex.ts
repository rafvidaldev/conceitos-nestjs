import { RegexProcol } from "./regex.protocol";

export class OnlyLowercaseLettersRegex implements RegexProcol {
    execute(str: string): string {
        return str.replace(/[^a-z]/g, '');
    }
}