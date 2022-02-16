const fs = require('fs');

const data = fs.readFileSync('source/solvers/reactle/dictionary_en.json', 'utf8');

const dictionary = JSON.parse(data);

const uniq_dictionary = [...new Set(dictionary)];

if (dictionary.length !== uniq_dictionary.length) {
  console.log(`${dictionary.length - uniq_dictionary.length} duplicates found!`);

  const json_dictionary = JSON.stringify(uniq_dictionary);

  fs.writeFileSync('source/solvers/reactle/dictionary_en_uniq.json', json_dictionary);
} else {
  console.log('The dictionary is not containing any duplicate!');
}
