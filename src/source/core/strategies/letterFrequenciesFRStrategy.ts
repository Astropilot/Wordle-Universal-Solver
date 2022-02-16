import { SolverStrategy, WordleSolver } from "../solver";

export class LetterFrequenciesFRStrategy extends SolverStrategy {

  // We want the words that have the most higher count of most used letters in French
  override executeStrategy(solver: WordleSolver, possibleWords: Set<string>): Set<string> {
    if (solver.currentRowIndex > 0) return possibleWords; // Strategy only on first guess

    const wordsWithLettersCount = new Map<string, number>();

    for (const word of possibleWords) {
      const count = word.replaceAll('[^EAST]', '').length;
      wordsWithLettersCount.set(word, count);
    }

    const maxLettersCount = Math.max(...wordsWithLettersCount.values());

    return new Set([...wordsWithLettersCount.entries()]
            .filter(entry => entry[1] === maxLettersCount).map(entry => entry[0]));
  }
}
