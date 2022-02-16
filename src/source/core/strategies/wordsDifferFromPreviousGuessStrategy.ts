import { SolverStrategy, WordleSolver } from "../solver";

export class WordsDifferFromPreviousGuessStrategy extends SolverStrategy {

  // We want the words that have the least number of repeated letters
  override executeStrategy(solver: WordleSolver, possibleWords: Set<string>): Set<string> {
    if (solver.currentRowIndex === 0) return possibleWords; // Strategy not active on first guess

    const wordsDifferFromPreviousGuessCount = new Map<string, number>();

    for (const word of possibleWords) {
      const regexSpecificLetters = new RegExp(`[^${solver.previousGuesses[solver.previousGuesses.length - 1]}]`, 'g');
      const count = word.replace(regexSpecificLetters, '').length;

      wordsDifferFromPreviousGuessCount.set(word, count);
    }

    const specificCount = Math.max(...wordsDifferFromPreviousGuessCount.values());

    return new Set([...wordsDifferFromPreviousGuessCount.entries()]
            .filter(entry => entry[1] === specificCount).map(entry => entry[0]));
  }
}
