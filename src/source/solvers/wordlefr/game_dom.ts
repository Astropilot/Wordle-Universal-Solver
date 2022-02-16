import { GameDomInterface } from "../../core/game_dom";
import { CharacterInfo } from "../../core/solver";
import { environment } from "../../environment";

export class WordleFrGameDomInterface extends GameDomInterface {

  private getGameDomGridRows() {
    return document.querySelectorAll('.grid > .attempt');
  }

  isGameFinished(): boolean {
    return JSON.parse(localStorage.getItem('finished')!);
  }

  isGamePending(): boolean {
    return document.querySelector('div.has-letter') !== null;
  }

  getGameWordSize(): number {
    return this.getGameDomGridRows()[0]!.querySelectorAll('div#letter-container').length;
  }

  async sendWordToVirtualKeyboard(word: string): Promise<void> {
    for (const character of word) {
      window.dispatchEvent(new KeyboardEvent('keydown', {'key': character}));
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}));
  }

  constructRowInfo(currentLineIndex: number): CharacterInfo[] {
    if (currentLineIndex === 0) {
      return [];
    }

    const rowElement = this.getGameDomGridRows()[currentLineIndex - 1]!;
    const letterCellElements = rowElement.querySelectorAll('div#letter-container');
    const rowInfo: CharacterInfo[] = [];

    // We construct our row with easy to access information for each letter
    for (let j = 0; j < letterCellElements.length; j++) {
      const cellElement = letterCellElements.item(j);
      const character = (cellElement.querySelector('div.letter')!.textContent ?? '').trim();
      let cellType: 'absent' | 'present' | 'correct';

      if (cellElement.classList.contains('incorrect')) {
        cellType = 'absent';
      } else if (cellElement.classList.contains('partial')) {
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
  const divKeyboard = document.querySelector('div.keyboard');
  const divResolve = document.createElement('div');
  const buttonSolve = document.createElement('button');

  divResolve.append(buttonSolve);
  divKeyboard?.parentNode?.insertBefore(divResolve, divKeyboard.nextSibling);

  buttonSolve.append(document.createTextNode('Résoudre !'));

  buttonSolve.addEventListener('click', onButtonClick);
}
