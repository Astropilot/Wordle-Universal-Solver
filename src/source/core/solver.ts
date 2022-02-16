import { environment } from "../environment";
import { GameDomInterface } from "./game_dom";

export interface CharacterInfo {
  character: string;
  type: 'absent' | 'present' | 'correct';
  index: number;
}

export interface CharacterFilters {
  count: number;
  countType: 'min' | 'exact';
  matchPositions: Set<number>;
  forbiddenPositions: Set<number>;
}

export abstract class WordleSolver {
  dictionary: string[];
  protected readonly strategies: SolverStrategy[] = [];
  currentRowIndex = 0;
  readonly previousGuesses: string[] = [];
  readonly wordSize: number;
  readonly charactersFilters = new Map<string, CharacterFilters>();
  protected readonly gameDom: GameDomInterface;

  constructor(dictionary: string[], gameDom: GameDomInterface, strategies?: SolverStrategy[]) {
    this.gameDom = gameDom;

    if (strategies !== undefined) {
      this.strategies = strategies;
    }

    this.wordSize = this.gameDom.getGameWordSize();
    this.dictionary = dictionary.filter(word => word.length === this.wordSize);
  }

  async start(turnDelay?: number) {
    while (!this.gameDom.isGameFinished()) {
      const rowInfo = this.gameDom.constructRowInfo(this.currentRowIndex);

      this.constructFiltersQuery(rowInfo);

      if (environment.debugOutput) {
        console.log('Characters filters', this.charactersFilters);
      }

      this.filterDictionary();

      if (environment.debugOutput) {
        console.log('Dictionary', this.dictionary);
      }

      const possibleWords = this.executeAllStrategies();

      if (environment.debugOutput) {
        console.log('Potential words list', possibleWords);
      }

      // Fallback at the end if we have many words possible. Random time!
      const wordGuess = this.randomElementFromSet(possibleWords);

      if (environment.debugOutput) {
        console.log('Final word to write', wordGuess);
      }

      this.previousGuesses.push(wordGuess);

      this.gameDom.sendWordToVirtualKeyboard(wordGuess);

      if (turnDelay !== undefined) {
        await new Promise(resolve => setTimeout(resolve, turnDelay));
      }

      this.currentRowIndex++;

      if (environment.debugOutput) {
        console.log('-'.repeat(20));
      }
    }
  }

  protected randomElementFromSet(set: Set<any>): any {
    const items = Array.from(set);

    return items[Math.floor(Math.random() * items.length)];
  }

  protected executeAllStrategies(): Set<string> {
    let possibleWords = new Set<string>(this.dictionary);

    for (const strategy of this.strategies) {
      possibleWords = strategy.executeStrategy(this, possibleWords);
    }
    return possibleWords;
  }

  protected constructFiltersQuery(rowInfo: CharacterInfo[]): void {

    for (const characterInfo of rowInfo) {
      const characterCount = rowInfo.filter(row => characterInfo.character === row.character && row.type !== 'absent').length;

      if (this.charactersFilters.has(characterInfo.character)) {
        this.charactersFilters.get(characterInfo.character)!.count = characterCount;
      } else {
        this.charactersFilters.set(characterInfo.character, {
          count: characterCount,
          countType: 'min',
          matchPositions: new Set(),
          forbiddenPositions: new Set(),
        });
      }

      switch (characterInfo.type) {
        case 'absent': {
          this.charactersFilters.get(characterInfo.character)!.countType = 'exact';
          break;
        }
        case 'present': {
          this.charactersFilters.get(characterInfo.character)!.forbiddenPositions.add(characterInfo.index);
          break;
        }
        case 'correct': {
          this.charactersFilters.get(characterInfo.character)!.matchPositions.add(characterInfo.index);
          break;
        }
      }
    }
  }

  protected filterDictionary(): void {
    this.dictionary = this.dictionary.filter(word => {
      for (const [character, info] of this.charactersFilters) {
        const occurenceCount = [...word].filter(c => c === character).length;

        if (info.countType === 'min' && occurenceCount < info.count) {
          return false;
        }

        if (info.countType === 'exact' && occurenceCount !== info.count) {
          return false;
        }

        for (const characterPosition of info.forbiddenPositions) {
          if (word[characterPosition] === character) {
            return false;
          }
        }

        for (const characterPosition of info.matchPositions) {
          if (word[characterPosition] !== character) {
            return false;
          }
        }
      }

      return true;
    });
  }
}

export abstract class SolverStrategy {
  executeStrategy(_solver: WordleSolver, possibleWords: Set<string>): Set<string> {
    return possibleWords;
  }
}
