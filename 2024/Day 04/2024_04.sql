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
    joined as (
        select
            char1.x
          , char1.y
          , count(1) as dirs
        from input as char1
        cross join dirs
        join input as char2
            on char1.x + dirs.x = char2.x
            and char1.y + dirs.y = char2.y
        join input as char3
            on char2.x + dirs.x = char3.x
            and char2.y + dirs.y = char3.y
        join input as char4
            on char3.x + dirs.x = char4.x
            and char3.y + dirs.y = char4.y
        where char1.char = 'X'
          and char2.char = 'M'
          and char3.char = 'A'
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
    joined as (
        select
            char2.x
          , char2.y
          , count(1) as num_mas
        from input as char1
        cross join xdirs
        join input as char2
            on char1.x + xdirs.x = char2.x
            and char1.y + xdirs.y = char2.y
        join input as char3
            on char2.x + xdirs.x = char3.x
            and char2.y + xdirs.y = char3.y
        where char1.char = 'M'
          and char2.char = 'A'
          and char3.char = 'S'
        group by 1, 2
    )

select count(1) as result
from joined
where num_mas > 1;
