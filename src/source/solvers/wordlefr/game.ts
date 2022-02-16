import { WordleSolver } from "../../core/solver";
import { LessRepeatedLettersStrategy } from "../../core/strategies/lessRepeatedLettersStrategy";
import { WordsDifferFromPreviousGuessStrategy } from "../../core/strategies/wordsDifferFromPreviousGuessStrategy";
import { environment } from "../../environment";
import { addSolveButtonToGame, WordleFrGameDomInterface } from "./game_dom";

class WordleFrGameSolver extends WordleSolver {
}

(async () => {
  await new Promise(resolve => setTimeout(resolve, 4000));

  const wordlefrGameDom = new WordleFrGameDomInterface();

  if (wordlefrGameDom.isGameFinished() || wordlefrGameDom.isGamePending()) {
    if (environment.debugOutput) {
      console.log('Game already started or already finished!');
    }
    return;
  }

  const dictionary: string[] = await (await fetch(chrome.runtime.getURL('solvers/wordlefr/dictionary_fr.json'))).json();
  const wordlefrSolver = new WordleFrGameSolver(dictionary, wordlefrGameDom, [
    new LessRepeatedLettersStrategy(),
    new WordsDifferFromPreviousGuessStrategy()
  ]);

  addSolveButtonToGame(async function handler() {
    this.removeEventListener('click', handler);
    await wordlefrSolver.start(3000);
    this.remove();
    if (environment.debugOutput) {
      console.log('Game finished!');
    }
  });
})();
