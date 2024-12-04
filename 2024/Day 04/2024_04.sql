/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    regexp_split_to_array(line, '') as line
                  , row_number() over ()            as y
                from read_csv('./2024/Day 04/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            unnest(line)                 as char
          , generate_subscripts(line, 1) as x
          , y
        from cte
    );

/* Part 1 */
create temp table dirs as
    (
        select -1 as x, -1 as y
        union all
        select 0, -1
        union all
        select 1, -1
        union all
        select -1, 0
        union all
        select 1, 0
        union all
        select -1, 1
        union all
        select 0, 1
        union all
        select 1, 1
    );

with
    cte as (
        select *
        from input
        where char = 'X'
    )
  , joined as (
        select
            cte.x
          , cte.y
          , count(1) as dirs
        from cte
        cross join dirs
        join input as char2
            on cte.x + dirs.x = char2.x
            and cte.y + dirs.y = char2.y
            and char2.char = 'M'
        join input as char3
            on cte.x + 2 * dirs.x = char3.x
            and cte.y + 2 * dirs.y = char3.y
            and char3.char = 'A'
        join input as char4
            on cte.x + 3 * dirs.x = char4.x
            and cte.y + 3 * dirs.y = char4.y
            and char4.char = 'S'
        group by 1, 2
    )

select sum(dirs) as result
from joined;


/* Part 2 */

create temp table xdirs as
    (
        select -1 as x, -1 as y
        union all
        select 1, -1
        union all
        select -1, 1
        union all
        select 1, 1
    );

with
    cte as (
        select *
        from input
        where char = 'M'
    )
  , joined as (
        select
            char2.x
          , char2.y
          , count(1) as num_mas
        from cte
        cross join xdirs
        join input as char2
            on cte.x + xdirs.x = char2.x
            and cte.y + xdirs.y = char2.y
            and char2.char = 'A'
        join input as char3
            on cte.x + 2 * xdirs.x = char3.x
            and cte.y + 2 * xdirs.y = char3.y
            and char3.char = 'S'
        group by 1, 2
    )

select count(1) as result
from joined
where num_mas > 1;
