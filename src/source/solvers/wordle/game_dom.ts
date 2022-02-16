import { GameDomInterface } from "../../core/game_dom";
import { CharacterInfo } from "../../core/solver";
import { environment } from "../../environment";

interface GameApp {
  gameStatus: 'IN_PROGRESS' | 'FAIL' | 'WIN';
  boardState: string[];
  rowIndex: number;
}

const wordle: any = window.wordle;

export class WordleGameDomInterface extends GameDomInterface {

  getGameElement(): Element | null | undefined {
    return document.querySelector('body > game-app')
      ?.shadowRoot?.querySelector('game-theme-manager')
      ?.querySelector('#game');
  }

  private getKeyboardElement(): Element | null | undefined {
    return this.getGameElement()
      ?.querySelector('game-keyboard')
      ?.shadowRoot?.querySelector('#keyboard');
  }

  private getGameDomGridRows() {
    return this.getGameElement()?.querySelectorAll('game-row')!;
  }

  isGameFinished(): boolean {
    const game: GameApp = new wordle.bundle.GameApp();

    return game.gameStatus !== 'IN_PROGRESS';
  }

  isGamePending(): boolean {
    const game: GameApp = new wordle.bundle.GameApp();

    return game.gameStatus === 'IN_PROGRESS' && game.rowIndex > 0;
  }

  getGameWordSize(): number {
    return this.getGameDomGridRows()[0]!.shadowRoot!
    .querySelector('div[class="row"]')!
    .querySelectorAll('game-tile')!.length;
  }

  async sendWordToVirtualKeyboard(word: string): Promise<void> {
    for (const letter of word) {
      this.getKeyboardElement()?.querySelector<HTMLElement>(`button[data-key="${letter.toLowerCase()}"]`)?.click();
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.getKeyboardElement()?.querySelector<HTMLElement>('button[data-key="↵"]')?.click();
  }

  constructRowInfo(currentLineIndex: number): CharacterInfo[] {
    if (currentLineIndex === 0) {
      return [];
    }

    const rowElement = this.getGameDomGridRows()[currentLineIndex - 1]!;
    const letterCellElements = rowElement.shadowRoot
    ?.querySelector('div[class="row"]')
    ?.querySelectorAll('game-tile')!;
    const rowInfo: CharacterInfo[] = [];

    // We construct our row with easy to access information for each letter
    for (let j = 0; j < letterCellElements.length; j++) {
      const cellElement = letterCellElements.item(j).shadowRoot!.querySelector<HTMLElement>('div[class="tile"]')!;
      const character = cellElement.textContent ?? '';
      let cellType: 'absent' | 'present' | 'correct';

      if (cellElement.dataset['state'] === 'absent') {
        cellType = 'absent';
      } else if (cellElement.dataset['state'] === 'present') {
        cellType = 'present';
      } else if (cellElement.dataset['state'] === 'correct') {
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

export function addSolveButtonToGame(wordleGameDom: WordleGameDomInterface, onButtonClick: (this: HTMLButtonElement, ev: MouseEvent) => any): void {
  const divContenu = wordleGameDom.getGameElement();
  const divGameModal = wordleGameDom.getGameElement()!.querySelector('game-modal');
  const divResolve = document.createElement('div');
  const buttonResolve = document.createElement('button');

  divResolve.append(buttonResolve);
  divContenu?.insertBefore(divResolve, divGameModal);

  buttonResolve.append(document.createTextNode('Solve!'));

  buttonResolve.addEventListener('click', onButtonClick);
}
