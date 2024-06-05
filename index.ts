import fs from 'node:fs/promises'
import { chromium } from 'playwright';

const log = (...strings: string[]) => console.log("[lb-scrape]", ...strings)

const fileName = './bizkit-data.tsv'
let file: fs.FileHandle;

// Opening the file
try {
  file = await fs.open(fileName, "a")
} catch (e) {
  console.error('Failed to open the data file. Exiting.')
  process.exit(1)
}

// Running the scraper
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage()

log("Opening Limp Bizkit's setlist page...")

await page.goto('https://www.setlist.fm/setlists/limp-bizkit-33d69c2d.html')

log("Limp Bizkit's setlist page opened")

const setLinks = await page.locator('a.summary.url').all()

for (const setLink of setLinks) {
  const linkContent = await setLink.innerText()
  const setLinkUrl: string | null = await setLink.getAttribute('href')

  if (!setLinkUrl) {
    log(`Whoops! Couldn't find a setlist URL! Continuing...`)
    continue;
  }

  log(`Opening page ${setLinkUrl}... `)

  const setLinkPage = await context.newPage()

  log(`Navigating to setlist set list page ${linkContent}`)

  await setLinkPage.goto(`https://www.setlist.fm/${setLinkUrl.slice(3)}`)
  const setLinkPageTitle = await setLinkPage.title()

  log("Now we're on the new page!", setLinkPageTitle)

  log("Now lets get some data...")

  const songData = await setLinkPage.locator(".setlistParts.song").all()

  let writtenSongCount = 0

  for (const song of songData) {
    const title = await song.locator(".songPart").innerText();
    const info = await song.locator(".infoPart").innerText();
    if (!title) {
      log(`Whoops! Song title doesn't exist for some reason... Continuing...`)
      continue;
    }
    const row = `${title}\t${info}\t${linkContent}`
    log(`Writing ${row} to ${fileName}`)
    file.write(`${row}\n`)
    writtenSongCount++;
    log(`Writing ${row} to ${fileName} complete!`)
  }

  log(`Wrote ${writtenSongCount} ${writtenSongCount === 1 ? "song" : "songs"} to ${fileName}`);

  log(`Closing page ${setLinkPageTitle}...`)

  await setLinkPage.close()
  log(`Page ${setLinkPageTitle} closed`)
}

log(`Scraping completed! Closing browser...`)
await browser.close();
log(`Browser closed...`)

log(`Closing ${fileName}...`)
await file.close()
log(`${fileName} closed...`)

log(`All done! See ya! 🎸🎵`)
