import axios, { type AxiosRequestConfig } from 'axios';
import { JSDOM } from 'jsdom';
import { getSong, addSong } from './db';

/**
  Adds a song to the database. If the song is already in the database, then do nothing.

  @returns true if the operation was successful, false if it didn't
*/

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

for(const url of setListUrls.slice(0,1)) {
  res = await axios.get(url, axiosOptions)
  if (res.status !== 200) continue

  const dom = new JSDOM(res.data)

  // get venue and date from the DOM


  // Save concert to the database

  
  const songData = dom.window.document.querySelectorAll('li.setlistParts.song')
  let order = 0;

  for (const songDatum of songData) {
    order++;
    // Get the song from the DOM
    const songLink = songDatum.querySelector<HTMLAnchorElement>('.songPart .songLabel')

    if (songLink === null) {
      console.error("Failed to find song link in web page. Continuing...")
      continue
    }

    const songName: string = songLink.textContent ? songLink.textContent.trim() : ""

    if (songName.length <= 0) {
      console.error("Song name is too short. Continuing...")
      continue
    }

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



    const notes: string | null = songDatum.querySelector<HTMLElement>('.infoPart small')!.textContent

    // insert row into the database
    order++
  }
}
