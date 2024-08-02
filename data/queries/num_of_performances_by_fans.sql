with fpc as (
  select count(*) as count from fan_performances
),
tpc as (
  select count(*) as count from performances
)
select 'with fans' as "Performances", fpc.count as "Number of performances"
from fpc
union all
select 'without fans' as "Performances", (tpc.count - fpc.count) as "Number of performances"
from fpc, tpc
union all
select 'total' as "Performances", tpc.count as "Number of performances"
from tpc;
