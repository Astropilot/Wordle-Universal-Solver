import { CharacterInfo } from "./solver";

export abstract class GameDomInterface {
  abstract isGameFinished(): boolean;

  abstract isGamePending(): boolean;

  abstract getGameWordSize(): number;

  abstract sendWordToVirtualKeyboard(word: string): Promise<void>;

  abstract constructRowInfo(currentLineIndex: number): CharacterInfo[];
}
