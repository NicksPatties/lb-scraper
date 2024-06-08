import { WriteStream } from 'node:fs';
import fs from 'node:fs/promises'
import { chromium } from 'playwright';

// Handle arguments

const argsInput: string[] = [...process.argv].slice(2)
const args = {}

const printUsage = () => {
  console.log(
    `Usage: [node] [lbpp] [-s <number>] [-e <number>]
   -s <number>
     start scraping at page <number> (1 by default)
   -e <number>
     end scraping at page <number> (105 by default)
`
  )
}

for (let i = 0; i < argsInput.length; i = i + 2) {
  const name: string = argsInput[i]
  const value: number = parseInt(argsInput[i + 1])
  if (!name.match("-[s|e]") || !value) {
    console.error(`Error with arg ${name}, value ${value}`)
    printUsage()
    process.exit(1);
  }
  args[name] = value
}

// End handling arguments

const startPage = args['-s'] || 1
/**
  `endPage` is **not** inclusive! This page will not be scraped!
*/
const endPage = args['-e'] || 105

/**
  Writes a log entry to a given log file.
*/
const log = (stream: WriteStream, ...strings: string[]) => {
  stream.write(["[lbpp]", ...strings].join(' ') + '\n')
}

/**
  Writes a row of data to stdout. Each item is separated by `\t`.
  A newline is added to the end of the line.

  @param {string[]} data The data that will be pasted in the row
*/
const writeRow = (data: string[]) => { process.stdout.write(data.join("\t") + '\n') }


/**
  Returns YYYY-MM-DD from the date string
*/
const getFormattedDateString = (d: Date): string => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`
}

/**
  Assumes you want the file to be in the `logs` directory of the project
*/
const getLogFileName = (): string => {
  const today = new Date();
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  const seconds = String(today.getSeconds()).padStart(2, '0')

  return `./logs/${year}${month}${day}-${hours}${minutes}${seconds}.log`;
}

const fileName = getLogFileName()
let logFile: fs.FileHandle;
let logFileStream: WriteStream;

// Opening the file
try {
  logFile = await fs.open(fileName, "a")
  logFileStream = logFile.createWriteStream({encoding: 'utf8'})
} catch (e) {
  console.error('Failed to open the log file.', e)
  process.exit(1)
}

// Add headings to output
writeRow(["Order", "Song", "Info", "Concert", "Date"])

// Running the scraper
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage()

const pages = endPage
let currPage = startPage

while (currPage < pages) {
  log(logFileStream, `Opening Limp Bizkit's setlist page ${currPage}...`)

  await page.goto(`https://www.setlist.fm/setlists/limp-bizkit-33d69c2d.html?page=${currPage}`)

  log(logFileStream, `Limp Bizkit's setlist page ${currPage} opened`)

  const setLinks = await page.locator('a.summary.url').all()

  for (const setLink of setLinks) {
    const linkContent = await setLink.innerText()
    const setLinkUrl: string | null = await setLink.getAttribute('href')

    if (!setLinkUrl) {
      log(logFileStream, `Whoops! Couldn't find a setlist URL! Continuing...`)
      continue;
    }

    const setLinkPage = await context.newPage()

    log(logFileStream, `Opening setlist page ${linkContent}...`)

    await setLinkPage.goto(`https://www.setlist.fm/${setLinkUrl.slice(3)}`)

    log(logFileStream, `Setlist page ${linkContent} opened`)

    const songData = await setLinkPage.locator(".setlistParts.song").all()

    log(logFileStream, `Writing songs data to ${fileName}...`)

    let date = '' 
    const dateData = new Date(
      await setLinkPage.locator(".dateBlock").first().innerText()
    )

    if (dateData) {
      date = getFormattedDateString(dateData)
    }

    let writtenSongCount = 0
    let order = 1
    for (const songDatum of songData) {
      const song = await songDatum.locator(".songPart").innerText();
      const info = await songDatum.locator(".infoPart").innerText();
      const concert = linkContent
      const row = [order + '', song, info, concert, date]
      writeRow(row)
      writtenSongCount++;
      order++;
    }

    log(logFileStream, `Wrote ${writtenSongCount} ${writtenSongCount === 1 ? "song" : "songs"} to ${fileName}`);

    await setLinkPage.close()
  }
  currPage++
}


log(logFileStream, `Scraping completed! Closing browser...`)
await browser.close();
log(logFileStream, `Browser closed...`)

log(logFileStream, `All done! See ya! 🎸🎵`)

await logFile.close()
