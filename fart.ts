import fs from 'node:fs';

const content = 'Uh hello??';

fs.writeFile('./hellothere.txt', content, err => {
  if (err) {
    console.error(err);
  }
  console.log("I wrote the file!")
});
