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
    console.log('just added the song', name, '... now what?')
    return true
  } catch (e) {
    console.error(`Error adding song "${name}": Perhaps it's already in the database?`)
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
    console.error(`Error adding concert "${venue}" at date ${date}`)
    console.error(e)
    return false
  }
}
// const addConcertStatement = db.prepare(
//   "insert into concerts (venue, date) values (?, ?)"
// )


/**
  Gets a performance of a song at a concert
  
*/
export const getPerformance = () => {
  return null;
}

/**
  Adds a performance to the database
  They played this song at this venue on this date

  @param {number} songOrder The order in which the song was played
  @param {string} notes Any interesting notes about the performance
  @param {string} songName
  @param {string} venue 
  @param {string} date The date of the performance in YYYY-MM-DD format
  @returns true if successfully added, false if it didn't
*/
export const addPerformance = (songOrder: number, notes: string | null, songName: string, venue: string, date: string) => {
  try {
    const song = getSong(songName)
    if (song === null) {
      throw new Error(`Requested song ${songName} doesn't exist`)
    }
    const concert = getConcertStatement.get(venue, date) as Concert;
    if (concert === null) {
      throw new Error(`Requested concert at ${venue} on ${date} doesn't exist`)
    }

    console.log("adding new performance for song", song.songId, "and concert", concert.concertId)

    addPerformanceStatement.run(songOrder, notes, concert.concertId, song.songId)
    return true;
  } catch (e) {
    console.error(e)
    return false;
  }
}
const addPerformanceStatement = db.prepare("insert into performances (songOrder, notes, concertId, songId) values (?, ?, ?, ?)");

