import axios, { type AxiosRequestConfig } from 'axios';
import { JSDOM } from 'jsdom';

let page = 1
const pageLimit = 2
const setListUrls: string[] = []
const axiosOptions: AxiosRequestConfig = {
  validateStatus: (status) => status < 500
}
const lbUrlBase = "https://www.setlist.fm/setlists/limp-bizkit-33d69c2d.html?page="

let res = await axios.get(lbUrlBase + page, axiosOptions)

// iterate through the concert list pages and get URLs for each set list
while (res.status === 200 && page < pageLimit) {
  const dom = new JSDOM(res.data)
  const eventList = dom.window.document.querySelectorAll(".vevent")

  for (const event of eventList) {

    const notPerformed = event.querySelector("ol.list-inline") === null
    if (notPerformed) continue;

    const setListLink: HTMLAnchorElement | null = event.querySelector('h2 a')
    if (setListLink === null) continue;

    setListUrls.push("https://setlist.fm" + setListLink.href.slice(2))
  }

  page++;
  res = await axios.get(lbUrlBase + page, axiosOptions)
}

// iterate through the setlistUrls to get individual song performances

for(const url of setListUrls) {
  res = await axios.get(url, axiosOptions)
  if (res.status !== 200) continue

  const dom = new JSDOM(res.data)
  const songData = dom.window.document.querySelectorAll('li.setlistParts.song')
  let order = 1;
  for (const songDatum of songData) {
    const song: string | null = songDatum.querySelector<HTMLAnchorElement>('.songPart .songLabel')!.textContent
    if (!song) continue;

    const notes: string | null = songDatum.querySelector<HTMLElement>('.infoPart small')!.textContent

    // insert row into the database
    console.log(order, song.trim(), notes ? notes.trim().replaceAll('\n', '') : null)
    order++
  }
}
