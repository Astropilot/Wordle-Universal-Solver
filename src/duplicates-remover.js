const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 1 || args.length > 2) {
  console.log('Usage: node duplicates-remover.js DICTIONARY_PATH [UNIQ_DICTIONARY_PATH]');
  process.exit(1);
}

const dictionary_path = args[0];

if (!fs.existsSync(dictionary_path)) {
  console.log(`The dictionary path "${dictionary_path}" do not exist or the file cannot be found!`);
  process.exit(1);
}

const dictionary_json = fs.readFileSync(dictionary_path, 'utf8');

const dictionary = JSON.parse(dictionary_json);

const uniq_dictionary = [...new Set(dictionary)];

if (dictionary.length === uniq_dictionary.length) {
  console.log('The dictionary is not containing any duplicate!');
  process.exit(0);
}

console.log(`${dictionary.length - uniq_dictionary.length} duplicates found!`);

const dictionary_uniq_json = JSON.stringify(uniq_dictionary);
let dictionary_uniq_path = '';

if (args.length === 2) {
  dictionary_uniq_path = args[1];
} else {
  dictionary_uniq_path = path.join(path.dirname(dictionary_path), path.basename(dictionary_path, 'json') + '_uniq.json');
}

fs.writeFileSync(dictionary_uniq_path, dictionary_uniq_json);
