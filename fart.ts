import fs from 'node:fs/promises';

try {
  // writing stuff to a file
  const file = await fs.open('./hellothere.txt', "r+")
  await file.write("fart\t")
  await file.write("fart again\t")
  await file.write("The super cool place\n")
  await file.close()

  // reading contents of a file
  const contents = await fs.readFile('./hellothere.txt', { encoding: 'utf8' })
  console.log(contents)
} catch (e) {
  console.error('SOMETHING WENT WRONG', e)
}
