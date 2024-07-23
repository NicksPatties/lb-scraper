import { JSDOM } from 'jsdom';

export const DOMNotFoundError = (selector: string): Error => new Error(`Failed to find DOM for selector ${selector}`)

export const TextContentNotFoundError = (): Error => new Error(`Failed to find textContent`)
/**
  Gets the date of a concert from the setlist.fm concert DOM

  @returns a date string in YYYY-MM-DD format
  @throws Error if the DOM or the date text doesn't exist

*/
export const getDateFromDom = (dom: JSDOM): string => {

  const dateBlock = dom.window.document.querySelector('.dateBlock')
  if (dateBlock === null) {
    throw DOMNotFoundError('.dateBlock')    
  }

  const yearDom = dateBlock.querySelector('.year')
  const monthDom = dateBlock.querySelector('.month')
  const dayDom = dateBlock.querySelector('.day')
  if (yearDom === null || monthDom === null || dayDom === null) {
    throw DOMNotFoundError('.year, .month. or .day')
  }

  const yearText = yearDom.textContent
  const monthText = monthDom.textContent
  const dayText = dayDom.textContent
  if (yearText === null || monthText === null || dayText === null) {
    throw TextContentNotFoundError()
  }

  let d = new Date(`${monthText} ${dayText} ${yearText}`)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`
}

/**
  Gets the date of a venue name from the setlist.fm concert DOM

  @returns the name of the venue
  @throws Error if the DOM or the venue text doesn't exist
*/
export const getVenueFromDom = (dom: JSDOM): string => {
  // .setlistHeadline h1 span span a
  const selector = ".setlistHeadline h1 span span a"
  const venueDom = dom.window.document.querySelector(selector)
  if (venueDom === null) {
    throw DOMNotFoundError(selector)    
  }

  const venueName = venueDom.textContent

  if (venueName === null) {
    throw TextContentNotFoundError()
  }

  return venueName
}

/**
  Gets song names from an HTML element

  @param {Element} element
  @returns The name of the song
*/
export const getSongFromDom = (element: Element): string => {

  const songLabelSelector = '.songPart .songLabel'
  const songLink = element.querySelector<HTMLAnchorElement>(songLabelSelector)

  if (songLink === null) {
    throw DOMNotFoundError(songLabelSelector)
  }

  if (songLink.textContent === null) {
    throw TextContentNotFoundError()
  }

  return songLink.textContent.trim()
}

/**
  @param {Element} element
  @returns either the notes, or an empty string
*/
export const getNotesFromDom = (element: Element): string => {
  const infoSelector = ".infoPart small"
  const infoSpan = element.querySelector<HTMLSpanElement>('.infoPart small')

  if (infoSpan === null) {
    // I still want to throw, since even though there may not
    // be notes inside the element, I need to know if the
    // DOM and selectors fail for some reason
    throw DOMNotFoundError(infoSelector)
  }

  return infoSpan.textContent ? 
    infoSpan.textContent.trim().replaceAll('\n', '') :
    ""
}
