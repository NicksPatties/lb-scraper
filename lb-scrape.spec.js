// example.spec.js
const { chromium } = require('playwright');
const { beforeAll, afterAll, test } = require('@playwright/test')

let browser, context

let page;

let maxPageNumbers = 2

beforeAll(async () => {
  // Create and open the csv file if it doesn't exits
  
  // Launch the browser and create a new context
  browser = await chromium.launch();
  context = await browser.newContext();
  page = await context.newPage()
});

afterAll(async () => {
  // close the browser
  await browser.close();

  // close the csv file
});

test(`LB Scraper`, async () => {
  await page.goto('https://www.setlist.fm/setlists/limp-bizkit-33d69c2d.html')

  const setLinks = await page.locator('a.summary.url').all()
  
  // For each link to a setlist
  for (const set of setLinks)
    // Open a new tab to that setlist
    console.log(await set.textContent())
    // get the songs from that new tab
});

