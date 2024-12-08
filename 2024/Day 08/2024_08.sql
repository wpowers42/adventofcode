/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    row_number() over ()            as y
                  , regexp_split_to_array(line, '') as line
                from read_csv('./2024/Day 08/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            generate_subscripts(line, 1) as x
          , y
          , unnest(line)                 as cell
        from cte

    );

set variable max_x = (select max (x) from input);
set variable max_y = (select max (y) from input);

/* Part 1 */
with
    cte as (
        select
            x
          , y
          , cell
        from input
        where cell != '.'
    )
  , joined as (
        select
            a.x     as x1
          , a.y     as y1
          , b.x     as x2
          , b.y     as y2
          , y2 - y1 as dy
          , x2 - x1 as dx
          , x1 - dx as x3
          , y1 - dy as y3
        from cte a
        join cte b
            on not (a.x = b.x and a.y = b.y)
            and a.cell = b.cell
    )


select distinct {'x': x3, 'y': y3} as point
from joined
where x3 between 1
  and getvariable('max_x')
  and y3 between 1
  and getvariable('max_y')
order by 1;

/* Part 2 */
drop table if exists antennas;
create temp table antennas as
    (
        select
            x
          , y
          , cell
        from input
        where cell != '.'
    );

drop table if exists antenna_pairs;
create temp table antenna_pairs as
    (
        select
            a.x      as x1
          , a.y      as y1
          , b.x - x1 as dx
          , b.y - y1 as dy
        from antennas a
        join antennas b
            on not (a.x = b.x and a.y = b.y)
            and a.cell = b.cell
    );

with
    recursive
    r(x, y, dx, dy) as (
        select
            x1 as x
          , y1 as y
          , dx
          , dy
        from antenna_pairs
        union all
        select
            x + dx
          , y + dy
          , dx
          , dy
        from r
        where x + dx between 1
            and getvariable('max_x')
          and y + dy between 1
            and getvariable('max_y')
    )

select count(distinct x || ',' || y) as result
from r;