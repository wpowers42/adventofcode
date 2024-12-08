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

drop table if exists antenna_pairs;
create temp table antenna_pairs as
    (
        select
            a.x
          , a.y
          , b.x - a.x as dx
          , b.y - a.y as dy
        from input a
        join input b
            on not (a.x = b.x and a.y = b.y)
            and a.cell = b.cell
        where a.cell != '.'
    );

/* Part 1 */

select count(distinct (x - dx) || ',' || (y - dy)) as result
from antenna_pairs
where (x - dx) between 1 and getvariable('max_x')
  and (y - dy) between 1 and getvariable('max_y');

/* Part 2 */

with
    recursive
    harmonics(x, y, dx, dy) as (
        select
            x
          , y
          , dx
          , dy
        from antenna_pairs
        union all
        select
            x + dx
          , y + dy
          , dx
          , dy
        from harmonics
        where x + dx between 1
            and getvariable('max_x')
          and y + dy between 1
            and getvariable('max_y')
    )

select count(distinct x || ',' || y) as result
from harmonics;
