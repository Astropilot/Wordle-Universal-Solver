import { WordleSolver } from "../../core/solver";
import { LessRepeatedLettersStrategy } from "../../core/strategies/lessRepeatedLettersStrategy";
import { LetterFrequenciesFRStrategy } from "../../core/strategies/letterFrequenciesFRStrategy";
import { WordsDifferFromPreviousGuessStrategy } from "../../core/strategies/wordsDifferFromPreviousGuessStrategy";
import { environment } from "../../environment";
import { addSolveButtonToGame, SutomGameDomInterface } from "./game_dom";

class SutomGameSolver extends WordleSolver {
}

(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const sutomGameDom = new SutomGameDomInterface();

  if (sutomGameDom.isGameFinished() || sutomGameDom.isGamePending()) {
    if (environment.debugOutput) {
      console.log('Game already started or already finished!');
    }
    return;
  }

  const dictionary: string[] = await (await fetch(chrome.runtime.getURL('solvers/sutom/dictionary_fr.json'))).json();
  const sutomSolver = new SutomGameSolver(dictionary, sutomGameDom, [
    new LetterFrequenciesFRStrategy(),
    new LessRepeatedLettersStrategy(),
    new WordsDifferFromPreviousGuessStrategy()
  ]);

  addSolveButtonToGame(async function handler() {
    this.removeEventListener('click', handler);
    this.classList.remove('lettre-bien-place');
    this.classList.add('lettre-mal-place');
    await sutomSolver.start(3500);
    this.remove();
    if (environment.debugOutput) {
      console.log('Game finished!');
    }
  });
})();
