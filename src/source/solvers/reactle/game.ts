import { WordleSolver } from "../../core/solver";
import { LessRepeatedLettersStrategy } from "../../core/strategies/lessRepeatedLettersStrategy";
import { WordsDifferFromPreviousGuessStrategy } from "../../core/strategies/wordsDifferFromPreviousGuessStrategy";
import { environment } from "../../environment";
import { addSolveButtonToGame, ReactleGameDomInterface } from "./game_dom";

class ReactleGameSolver extends WordleSolver {
}

(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const reactleGameDom = new ReactleGameDomInterface();

  if (reactleGameDom.isGameFinished() || reactleGameDom.isGamePending()) {
    if (environment.debugOutput) {
      console.log('Game already started or already finished!');
    }
    return;
  }

  const dictionary: string[] = await (await fetch(chrome.runtime.getURL('solvers/reactle/dictionary_en.json'))).json();
  const reactleSolver = new ReactleGameSolver(dictionary, reactleGameDom, [
    new LessRepeatedLettersStrategy(),
    new WordsDifferFromPreviousGuessStrategy()
  ]);

  addSolveButtonToGame(async function handler() {
    this.removeEventListener('click', handler);
    await reactleSolver.start(4000);
    this.remove();
    if (environment.debugOutput) {
      console.log('Game finished!');
    }
  });
})();
