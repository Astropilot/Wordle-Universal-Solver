import { GameDomInterface } from "../../core/game_dom";
import { CharacterInfo } from "../../core/solver";
import { environment } from "../../environment";

export class ReactleGameDomInterface extends GameDomInterface {

  private getGameDomGridRows() {
    return document.querySelectorAll('#root > div > div.pb-6 > div.flex');
  }

  isGameFinished(): boolean {
    const rows = this.getGameDomGridRows();
    let isVictory = false;

    for (const row of rows) {
      const correctCount = row.querySelectorAll('div.correct').length;

      if (correctCount === this.getGameWordSize()) {
        isVictory = true;
        break;
      }
    }

    const isLoose = document.querySelector('div.bg-rose-500.text-white > div.p-4 > p.text-center') !== null;

    return isVictory || isLoose;
  }

  isGamePending(): boolean {
    return this.getGameDomGridRows()[0]!.querySelector('div.absent, div.present, div.correct') !== null;
  }

  getGameWordSize(): number {
    return this.getGameDomGridRows()[0]!.querySelectorAll('div:not(.letter-container)').length;
  }

  async sendWordToVirtualKeyboard(word: string): Promise<void> {
    for (const character of word) {
      window.dispatchEvent(new KeyboardEvent('keyup', {'key': character}));
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    window.dispatchEvent(new KeyboardEvent('keyup', {'code': 'Enter'}));
  }

  constructRowInfo(currentLineIndex: number): CharacterInfo[] {
    if (currentLineIndex === 0) {
      return [];
    }

    const rowElement = this.getGameDomGridRows()[currentLineIndex - 1]!;
    const letterCellElements = rowElement.querySelectorAll('div:not(.letter-container)');
    const rowInfo: CharacterInfo[] = [];

    // We construct our row with easy to access information for each letter
    for (let j = 0; j < letterCellElements.length; j++) {
      const cellElement = letterCellElements.item(j);
      const character = cellElement.querySelector('div.letter-container')!.textContent ?? '';
      let cellType: 'absent' | 'present' | 'correct';

      if (cellElement.classList.contains('absent')) {
        cellType = 'absent';
      } else if (cellElement.classList.contains('present')) {
        cellType = 'present';
      } else if (cellElement.classList.contains('correct')) {
        cellType = 'correct';
      } else {
        if (environment.debugOutput) {
          console.error(`Character "${character}" on cell index ${j} do not have any type!`, rowElement);
        }

        cellType = 'absent';
      }

      rowInfo.push({character: character, type: cellType, index: j});
    }

    return rowInfo;
  }
}

export function addSolveButtonToGame(onButtonClick: (this: HTMLButtonElement, ev: MouseEvent) => any): void {
  const divInputArea = document.querySelector('#root > div > div:nth-child(3)');
  const divResolve = document.createElement('div');
  const buttonSolve = document.createElement('button');

  divResolve.append(buttonSolve);
  divInputArea?.parentNode?.insertBefore(divResolve, divInputArea.nextSibling);

  buttonSolve.append(document.createTextNode('Résoudre !'));

  buttonSolve.addEventListener('click', onButtonClick);
}
