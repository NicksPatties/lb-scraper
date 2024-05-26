# Limp Bizkit Probability Project

Limp Bizkit brings an audience member on stage to perform with them every once in a while. 

- [A fan performs Full Nelson at Sonic Temple 2024](https://www.instagram.com/p/C7Mt0JYN3sk/)
- [Fans on bass and guitar at Zeltfestival 2018](https://www.youtube.com/watch?v=G4xbg4OCMGg)
- [Fan performs My Way at Haus Auensee in 2015](https://youtu.be/r8e9KPY64DA)

If my friend and I are going to see them live, what songs should we learn to be the most prepared to perform a song with them and kill it?

To figure this out, I'll need some data, and then I'll do some analysis on that data. The site [setlist.fm](https://www.setlist.fm/) documents what songs a band played for any given concert. There are additional details about the songs as well, including whether a fan joined them to play. For the videos above, here's the information about the songs.

- [Sonic Temple 2024 setlist](https://www.setlist.fm/setlist/limp-bizkit/2024/historic-crew-stadium-columbus-oh-5babf3fc.html)
  - 9. Nookie / Full Nelson (with fan)
- [Zeltfestival 2018 setlist](https://www.setlist.fm/setlist/limp-bizkit/2018/palastzelt-maimarktgelande-mannheim-germany-1beadd64.html) 
  - 7. Gold Cobra (with two fans on guitar)
- [Haus Auensee in 2015 setlist](https://www.setlist.fm/setlist/limp-bizkit/2015/haus-auensee-leipzig-germany-5bc98f54.html)
  - 15. My Way (with fan on guitar & with Faith snippet in intro)

I'll use Playwright to scrape the data. Here's the data I'm looking for:

- Performance date
- Song title
- Info (if it's present)
- Location (not necessary, but it could say something about where they're more likely to perform)

## Method

1. Go to Limp Bizkit's setlist.fm page
2. Click the first link in the list of setlists
3. Read the contents of the setlist
4. Add it in a CSV
5. Use a Spreadsheet to analyze the data


