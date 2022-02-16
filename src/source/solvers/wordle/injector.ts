const scriptSolver = document.createElement('script');
const scriptDictionary = document.createElement('script');

scriptSolver.src = chrome.extension.getURL('solvers/wordle/game.js');
scriptDictionary.src = chrome.extension.getURL('solvers/wordle/dictionary_en.js');

scriptDictionary.addEventListener('load', () => {
  document.head.append(scriptSolver);
});

document.head.append(scriptDictionary);
