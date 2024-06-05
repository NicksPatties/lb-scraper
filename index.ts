import { chromium } from 'playwright';

const log = (...strings: string[]) => console.log("[lb-scrape]", ...strings)

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage()

log("Opening Limp Bizkit's setlist page")

await page.goto('https://www.setlist.fm/setlists/limp-bizkit-33d69c2d.html')

log("Let's try and grab something!")

const setLinks = await page.locator('a.summary.url').all()

for (const setLink of setLinks){
  const linkContent = await setLink.innerText()
  const setLinkUrl: string | null = await setLink.getAttribute('href')

  if (!setLinkUrl) {
    log(`Whoops! Couldn't find a setlist URL! Continuing...`)
    continue;
  }

  log(`Opening new page... `)
  
  const setLinkPage = await context.newPage()
  log(`Navigating to setlist set list page ${linkContent}`)
  
  await setLinkPage.goto(`https://www.setlist.fm/${setLinkUrl.slice(3)}`)
  const setLinkPageTitle = await setLinkPage.title()

  log("Now we're on the new page!", setLinkPageTitle)

  log("Now lets get some data...")

  const songData = await setLinkPage.locator(".setlistParts.song").all()

  for (const song of songData) {
    const title = await song.locator(".songPart").innerText();
    const info = await song.locator(".infoPart").innerText();
    if (!title) {
      log(`Whoops! Title does not exists die.`)
      continue;
    }
    log(`  title: ${title}`)
    log(`  info: ${!!info ? info : ""}`)
  }

  log("Data retrieved!");

  log("Closing page", setLinkPageTitle)

  await setLinkPage.close()
  log("Page closed")
}

await browser.close();
