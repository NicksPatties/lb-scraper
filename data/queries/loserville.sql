-- Performances during Loserville 2024 (July 16 to August 24)
select * from loserville;
select * from loserville_with_fans;
select * from loserville_with_fans_on_instruments;

-- Tour venue list
select distinct date, venue from loserville order by date;

-- Number of times fans performed on instruments
select count(*) from loserville_with_fans_on_instruments;

-- Songs with fan interaction by count
select distinct songName from loserville_with_fans;

-- Percentage of concerts X song was performed during
with Songs AS (
  select distinct songName as Song from loserville
),
performance_counts AS (
  select songName, count(distinct date) as Count
  from loserville
  where songName in (select Song from Songs)
  group by songName
),
total_concerts AS (
  select count(distinct venue) as total from loserville
)
select
  s.Song,
  coalesce(pc.Count, 0) as Count,
  tc.total as Total,
  round(cast(Count as float) / cast(Total as float) * 100.0) as "Percentage"
from Songs s
left join performance_counts pc ON s.Song = pc.songName
join total_concerts tc
-- if you want individual songs
-- where s.Song in ('Hot Dog', 'My Way', ...)
order by "Percentage" desc;

-- Song timing ratios for X songs
with spc as (
  select date, count(*) as songsPerConcert
  from loserville
  group by date
),
songTimingRatios as (
  select
    date,
    songName,
    round(cast(songOrder as float) / cast(songsPerConcert as float), 2)
      as songTimingRatio
  from loserville
  left join spc using (date)
  where date >= '2024-07-16'
  and songName in ( 'My Way', 'Hot Dog', 'Re-Arranged')
)
select
  MyWay.date as Date,
  MyWay.songTimingRatio as MyWayTimingRatios,
  HotDog.songTimingRatio as HotDogTimingRatios,
  ReArranged.songTimingRatio as ReArrangedTimingRatios
from songTimingRatios MyWay
left join songTimingRatios HotDog
  on MyWay.date = HotDog.date and HotDog.songName = 'Hot Dog'
left join songTimingRatios ReArranged
  on MyWay.date = ReArranged.date and ReArranged.songName = 'Re-Arranged'
where MyWay.songName is 'My Way'
order by MyWay.date;

