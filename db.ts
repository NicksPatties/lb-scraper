import { Database } from "bun:sqlite";
const db = new Database('./data/lb.db');

export type Song = {
  songId: number
  name: string
}

export type Concert = {
  concertId: number
  /**
    YYYY-MM-DD
  */
  date: string
  /**
    Name of the venue
  */
  venue: string
}

export type Performance = {
  performanceId: number
  notes: string
  songOrder: number
  concertId: number
  songId: number
}

/**
  @returns {Song | null} The song data if it exists, or null if it doesn't
*/
export const getSong = (name: string): Song | null => {
  return getSongStatement.get(name) as Song
}
const getSongStatement = db.prepare("select * from songs where name is ?")

/**
  Adds a song to the database. If the song is already in the database, then do nothing.

  @returns true if the operation was successful, false if it didn't
*/
export const addSong = (name: string): boolean => {
  try {
    // Running a prepared statement in here causes bun to segfault,
    // but not sure why...
    // addSongStatement.run(name)
    db.run("insert into songs (name) values (?)", [name]);
    return true
  } catch (e) {
    console.error(`Error adding song "${name}"`)
    console.error(e)
    return false
  }
}
// const addSongStatement = db.prepare("insert into songs (name) values (?)");


/**
  Gets a concerts from the database
  
  @param {string} venue
  @param {string} date YYYY-MM-DD
  @returns {Song | null} The song data if it exists, or null if it doesn't
*/
export const getConcert = (venue: string, date: string): Concert | null => {
  return getConcertStatement.get(venue, date) as Concert
}
const getConcertStatement = db.prepare('select * from concerts where venue is ? and date is ?')

/**
  Adds a concert to the database

  @param {string} venue The name of the concert venue
  @param {string} date The date the concert took place in YYYY-MM-DD format
  @returns true if successfully added, false otherwise
*/
export const addConcert = (venue: string, date: string) => {
  try {
    // addConcertStatement.run(venue, date)
    db.run(
      "insert into concerts (venue, date) values (?, ?)",
      [venue, date]
    )
    return true
  } catch (e) {
    console.error(`Error adding concert at ${venue} on ${date}`)
    console.error(e)
    return false
  }
}
// const addConcertStatement = db.prepare(
//   "insert into concerts (venue, date) values (?, ?)"
// )


/**
  @param {number} songOrder
  @param {number} songId
  @param {number} concertId
  @returns {Performance | null} The performance if it exists, null if it doesn't  
*/
export const getPerformance = (songOrder: number, songId: number, concertId: number): Performance | null => {
  return getPerformanceStatement.get(songOrder, songId, concertId) as Performance;
}
const getPerformanceStatement = db.prepare('select * from performances where songOrder is ? and songId is ? and concertId is ?')

/**
  Adds a performance to the database
  They played this song at this venue on this date

  @param {number} songOrder The order in which the song was played
  @param {string} notes Any interesting notes about the performance
  @param {number} songId
  @param {number} concertId 
  @returns true if successfully added, false if it didn't
*/
export const addPerformance = (
  songOrder: number,
  notes: string,
  songId: number,
  concertId: number
) => {
  try {
    addPerformanceStatement.run(songOrder, notes, concertId, songId)
    return true;
  } catch (e) {
    console.error(`Error adding performance `, songOrder, notes, songId, concertId)
    console.error(e)
    return false;
  }
}
const addPerformanceStatement = db.prepare("insert into performances (songOrder, notes, concertId, songId) values (?, ?, ?, ?)");

