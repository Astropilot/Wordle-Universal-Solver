import { WordleSolver } from "../../core/solver";
import { LessRepeatedLettersStrategy } from "../../core/strategies/lessRepeatedLettersStrategy";
import { WordsDifferFromPreviousGuessStrategy } from "../../core/strategies/wordsDifferFromPreviousGuessStrategy";
import { environment } from "../../environment";
import { addSolveButtonToGame, WordleGameDomInterface } from "./game_dom";

declare global {
  interface Window {
    [key: string]: any;
  }
}

class WordleGameSolver extends WordleSolver {
}

(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const wordleGameDom = new WordleGameDomInterface();

  if (wordleGameDom.isGameFinished() || wordleGameDom.isGamePending()) {
    if (environment.debugOutput) {
      console.log('Game already started or already finished!');
    }
    return;
  }

  const dictionary: string[] = window['dictionary'];
  const wordleSolver = new WordleGameSolver(dictionary, wordleGameDom, [
    new LessRepeatedLettersStrategy(),
    new WordsDifferFromPreviousGuessStrategy()
  ]);

  addSolveButtonToGame(wordleGameDom, async function handler() {
    this.removeEventListener('click', handler);
    await wordleSolver.start(3000);
    this.remove();
    if (environment.debugOutput) {
      console.log('Game finished!');
    }
  });
})();
