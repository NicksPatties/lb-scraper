# Limp Bizkit Scraper

## Purpose

Limp Bizkit brings an audience member on stage to perform with them every once in a while. 

- [A fan performs _Full Nelson_ at Sonic Temple 2024](https://www.instagram.com/p/C7Mt0JYN3sk/)
- [Fans on guitar at Zeltfestival 2018](https://www.youtube.com/watch?v=G4xbg4OCMGg)
- [Fans perform _Take A Look Around_ at Motorpoint Arena, England](https://www.youtube.com/watch?v=J1HPRFqZlik)

If my friend and I are going to see them live, **what songs should we learn to be the most prepared to perform a song with them and kill it?**

To figure this out, I'll need some data, and then I'll do some analysis on that data. The site [setlist.fm](https://www.setlist.fm/) documents what songs a band played for any given concert. There are additional details about the songs as well, including whether a fan joined them to play. Here's the information about the songs referenced in the videos above.

- [Sonic Temple 2024 setlist](https://www.setlist.fm/setlist/limp-bizkit/2024/historic-crew-stadium-columbus-oh-5babf3fc.html)
  - 9. Nookie / Full Nelson (with fan)
- [Zeltfestival 2018 setlist](https://www.setlist.fm/setlist/limp-bizkit/2018/palastzelt-maimarktgelande-mannheim-germany-1beadd64.html) 
  - 7. Gold Cobra (with two fans on guitar)
- [Haus Auensee in 2015 setlist](https://www.setlist.fm/setlist/limp-bizkit/2015/haus-auensee-leipzig-germany-5bc98f54.html)
  - 15. My Way (with fan on guitar & with Faith snippet in intro)

I'll use Playwright to scrape the data. Here's the data I'm looking for:

- Song order
- Song title
- Info (if it's present)
- Concert name
- Performance date

## Method

1. Go to Limp Bizkit's setlist.fm page
2. Click each link in the list of set lists
3. Read the song list of each 
4. Write the song data to STDOUT
5. Use a spreadsheet application to analyze the data

## Installation

This package uses `bun` to run.

```sh
bun run .
```
