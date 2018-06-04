export class PatternManager {
    constructor() { }

    //REF: https://stackoverflow.com/questions/9906885/detect-backspace-and-del-on-input-event
    public static limitWords(maxLetters: number, textLength: number) {
        let restLetters: number = maxLetters - textLength;
        return restLetters;
    }
}