import { GameDomInterface } from "../../core/game_dom";
import { CharacterInfo } from "../../core/solver";
import { environment } from "../../environment";

export class SutomGameDomInterface extends GameDomInterface {

  private getGameDomGridRows() {
    return document.querySelectorAll('#grille > table > tr');
  }

  isGameFinished(): boolean {
    return document.querySelector<HTMLElement>('.fin-de-partie-panel') !== null;
  }

  isGamePending(): boolean {
    return document.querySelector('td.resultat') !== null;
  }

  getGameWordSize(): number {
    return this.getGameDomGridRows()[0]!.querySelectorAll('td').length;
  }

  async sendWordToVirtualKeyboard(word: string): Promise<void> {
    for (const letter of word) {
      document.querySelector<HTMLElement>(`.input-lettre[data-lettre="${letter}"]`)?.click();
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    document.querySelector<HTMLElement>('.input-lettre[data-lettre="_entree"]')?.click();
  }

  constructRowInfo(currentLineIndex: number): CharacterInfo[] {
    if (currentLineIndex === 0) {
      const rowElement = this.getGameDomGridRows()[currentLineIndex]!;
      const letterCellElements = rowElement.querySelectorAll('td');

      return [{character: letterCellElements[0]!.textContent!, type: 'correct', index: 0}];
    }

    const rowElement = this.getGameDomGridRows()[currentLineIndex - 1]!;
    const letterCellElements = rowElement.querySelectorAll('td');
    const rowInfo: CharacterInfo[] = [];

    // We construct our row with easy to access information for each letter
    for (let j = 0; j < letterCellElements.length; j++) {
      const cellElement = letterCellElements.item(j);
      const character = cellElement.textContent ?? '';
      let cellType: 'absent' | 'present' | 'correct';

      if (cellElement.classList.contains('non-trouve')) {
        cellType = 'absent';
      } else if (cellElement.classList.contains('mal-place')) {
        cellType = 'present';
      } else if (cellElement.classList.contains('bien-place')) {
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

export function addSolveButtonToGame(onButtonClick: (this: HTMLDivElement, ev: MouseEvent) => any): void {
  const divInputArea = document.querySelector('#input-area');
  const divResolve = document.createElement('div');
  const buttonSolve = document.createElement('div');

  divResolve.append(buttonSolve);
  divInputArea?.parentNode?.insertBefore(divResolve, divInputArea.nextSibling);

  buttonSolve.classList.add('input-lettre', 'lettre-bien-place');
  buttonSolve.append(document.createTextNode('Résoudre !'));

  buttonSolve.addEventListener('click', onButtonClick);
}
