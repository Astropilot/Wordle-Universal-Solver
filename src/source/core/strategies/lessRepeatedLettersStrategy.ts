import { SolverStrategy, WordleSolver } from "../solver";

export class LessRepeatedLettersStrategy extends SolverStrategy {

  // We want the words that have the least number of repeated letters
  override executeStrategy(solver: WordleSolver, possibleWords: Set<string>): Set<string> {
    if (solver.currentRowIndex > 0) return possibleWords; // Strategy only on first guess

    const wordsWithRepeatedLettersCount = new Map<string, number>();

    for (const word of possibleWords) {
      const lettersInWord: string[] = [];
      let counter = 0;

      for (let letter of word) {
        if (lettersInWord.includes(letter)) {
          counter++;
        } else {
          lettersInWord.push(letter);
        }
      }

      wordsWithRepeatedLettersCount.set(word, counter);
    }

    const specificCount = Math.min(...wordsWithRepeatedLettersCount.values());

    console.log(`specificCount: ${specificCount}`);

    return new Set([...wordsWithRepeatedLettersCount.entries()]
            .filter(entry => entry[1] === specificCount).map(entry => entry[0]));
  }
}
