import axios, { type AxiosRequestConfig } from 'axios';
import { JSDOM } from 'jsdom';
import {
  getDateFromDom,
  getVenueFromDom,
  DOMNotFoundError,
  getSongFromDom,
  getNotesFromDom
} from './dom'
import {
  getSong,
  addSong,
  getConcert,
  addConcert,
  addPerformance,
  getPerformance
} from './db';
import { exit } from 'process';

/**
  Adds a song to the database. If the song is already in the database, then do nothing.

  @returns true if the operation was successful, false if it didn't
*/

let page = 54
const pageLimit = 106 // inclusive todo make this read the dom from 
const setListUrls: string[] = []
const axiosOptions: AxiosRequestConfig = {
  validateStatus: (status) => status < 500
}
const lbUrlBase = "https://www.setlist.fm/setlists/limp-bizkit-33d69c2d.html?page="

let res = await axios.get(lbUrlBase + page, axiosOptions)

// iterate through the concert list pages and get URLs for each set list
while (res.status === 200 && page <= pageLimit) {
  const dom = new JSDOM(res.data)
  const eventList = dom.window.document.querySelectorAll(".vevent")

  for (const event of eventList) {

    const notPerformed = event.querySelector("ol.list-inline") === null
    if (notPerformed) continue;

    const setListLinksSelector = 'h2 a'
    const setListLink: HTMLAnchorElement | null = event.querySelector(setListLinksSelector)
    if (setListLink === null) {
      throw DOMNotFoundError(setListLinksSelector)
    };

    setListUrls.push("https://setlist.fm" + setListLink.href.slice(2))
  }

  page++;
  res = await axios.get(lbUrlBase + page, axiosOptions)
}

console.log("setListUrls")
console.log(setListUrls)

const problemUrls: string[] = []
// iterate through the setlistUrls to get individual song performances
// TODO remove slice from list
for (const url of setListUrls) {
  res = await axios.get(url, axiosOptions)
  if (res.status !== 200) {
    console.warn(`Didn't get OK status for ${url}, ${res.status}, continuing...?`)
    problemUrls.push(url)
    continue
  }

  const dom = new JSDOM(res.data)

  const dateString = getDateFromDom(dom)
  const venueString = getVenueFromDom(dom)

  // Save concert to the database
  let concert = getConcert(venueString, dateString)
  if (concert === null) {
    console.log(`Concert at ${venueString} on ${dateString} doesn't exist in database. Adding it now.`)
    const success = addConcert(venueString, dateString);
    if (success) {
      console.log(`Successfully added concert at ${venueString} on ${dateString}  to database`)
    } else {
      console.error(`Failed to save concert at ${venueString} on ${dateString} in database`)
      continue
    }
    concert = getConcert(venueString, dateString)!
  } else {
    console.log(`Concert already in database! concertId: ${concert.concertId}`)
  }

  const songData = dom.window.document.querySelectorAll('li.setlistParts.song')
  let order = 0;

  for (const songDatum of songData) {
    order++;

    // Get the song from the DOM
    const songName: string = getSongFromDom(songDatum)

    // Save song to the database
    let song = getSong(songName)

    if (song === null) {
      // add song to the database
      console.log(`Song ${songName} doesn't exist in database. Adding it now.`)
      const success = addSong(songName)
      if (success) {
        console.log(`Successfully added ${songName} to database`)
      } else {
        console.error(`Failed to save ${songName} in database`)
        continue
      }
      song = getSong(songName)!
    } else {
      console.log(`${songName} already in database! songId: ${song.songId}`)
    }

    // Get notes from performance
    const notes = getNotesFromDom(songDatum)


    // Save performance to the database
    let performance = getPerformance(order, song.songId, concert.concertId)

    if (performance === null) {
      // add performance to the database
      const performanceDetails = `of ${song.name} on ${concert.date} at ${concert.venue}`
      console.log(`Performance ${performanceDetails} doesn't exist in database. Adding it now.`)
      const success = addPerformance(order, notes, song.songId, concert.concertId)
      if (success) {
        console.log(`Successfully added performance ${performanceDetails} to database`)
      } else {
        console.error(`Failed to save performance ${performanceDetails} in database`)
        continue
      }
      performance = getPerformance(order, song.songId, concert.concertId)!
    } else {
      console.log(`Performance already in database! performanceId: ${performance.performanceId}`)
    }
  }
}

if (problemUrls.length > 0) {
  console.warn("Had some issues with some concert URLs!")
  console.warn(problemUrls)
  exit(1)
} else {
  console.log("All concerts scraped successfully!")
  exit(0)
}
