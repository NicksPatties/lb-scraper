import { chromium } from 'playwright';

/*
  @param {Array<string>} strings
*/
const log = (...strings) => console.log("[lb-scrape]", ...strings)

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage()

log("Opening Limp Bizkit's setlist page")

await page.goto('https://www.setlist.fm/setlists/limp-bizkit-33d69c2d.html')

log("Let's try and grab something!")
log("one", "two", "three")

const setLinks = await page.locator('a.summary.url').all()

for (const setLink of setLinks){
  const linkContent = await setLink.textContent()
  log("Clicking", linkContent, "link...")
  await setLink.click()
  log("Clicked!")
  log("New page location", page.url(), await page.title())
  log("Going back...")
  await page.goBack()

  log("Returned to previous location", page.url(), await page.title())
}

await browser.close();
