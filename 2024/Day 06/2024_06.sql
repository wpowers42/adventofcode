/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    regexp_split_to_array(line, '') as line
                  , row_number() over ()            as y
                from read_csv('./2024/Day 06/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            y
          , generate_subscripts(line, 1) as x
          , case unnest(line)
                when '.' then 0
                when '#' then 1
                when '^' then 2
            end                          as cell
        from cte

    );

drop table if exists guard;
create temp table guard as
    (
        select
            x
          , y
          , 0  as dx
          , -1 as dy
        from input
        where cell = 2
    );

update input
set cell = 0
where cell = 2;

/* Part 1 */

with
    recursive
    year1518 (x, y, dx, dy) as (
        -- Base case
        select
            x
          , y
          , dx
          , dy
          , 0 as recursion_depth
        from guard
        union all
        -- Recursive step
        select
            case when next.cell = 0 then year.x + year.dx else year.x end as x
          , case when next.cell = 0 then year.y + year.dy else year.y end as y
          , case when next.cell = 0 then year.dx else -year.dy end        as dx
          , case when next.cell = 0 then year.dy else year.dx end         as dy
          , year.recursion_depth + 1                                      as recursion_depth
        from year1518 year
        join input as next
            on year.x + year.dx = next.x
            and year.y + year.dy = next.y
        where recursion_depth < 10000
    )


select
    -- count(distinct x || y) as result /* facepalm */
    count(distinct 'x' || x || 'y' || y) as result
  , max(recursion_depth)                 as max_recursion_depth
from year1518;

/* Part 2 */

drop table if exists stops;
create temp table stops as
    (
        with
            recursive
            year1518 (x, y, dx, dy) as (
                -- Base case
                select
                    x
                  , y
                  , dx
                  , dy
                  , 0 as recursion_depth
                from guard
                union all
                -- Recursive step
                select
                    case when next.cell = 0 then year.x + year.dx else year.x end as x
                  , case when next.cell = 0 then year.y + year.dy else year.y end as y
                  , case when next.cell = 0 then year.dx else -year.dy end        as dx
                  , case when next.cell = 0 then year.dy else year.dx end         as dy
                  , year.recursion_depth + 1                                      as recursion_depth
                from year1518 year
                join input as next
                    on year.x + year.dx = next.x
                    and year.y + year.dy = next.y
                where recursion_depth < 10000
            )


        select distinct
            x
          , y
          , 'x:' || x || ' y:' || y as stop_key
        from year1518
        where not exists
                  (
                      select 1
                      from guard
                      where year1518.x = guard.x
                        and year1518.y = guard.y
                  )
    );


drop table if exists scenarios;
create temp table scenarios as
    (
        select
            input.x :: smallint                                                                      as x
          , input.y :: smallint                                                                      as y
          , case when stops.x = input.x and stops.y = input.y then 1 else input.cell end :: smallint as cell
          , stop_key :: char(11)                                                                     as stop_key
        from stops
        cross join input
    );

with
    recursive
    year1518 (x, y, dx, dy, stop_key, path_keys, recursion_depth) as (
        -- Base case
        select
            guard.x :: smallint        as x
          , guard.y :: smallint        as y
          , guard.dx :: smallint       as dx
          , guard.dy :: smallint       as dy
          , stops.stop_key :: char(11) as stop_key
          , [] :: char(32)[]           as path_keys
          , 0                          as recursion_depth
        from guard
        cross join stops
        union all
        -- Recursive step
        select
            case when next.cell = 0 then year.x + year.dx else year.x end :: smallint                                           as x
          , case when next.cell = 0 then year.y + year.dy else year.y end :: smallint                                           as y
          , case when next.cell = 0 then year.dx else -year.dy end :: smallint                                                  as dx
          , case when next.cell = 0 then year.dy else year.dx end :: smallint                                                   as dy
          , year.stop_key :: char(11)                                                                                           as stop_key
          , array_append(year.path_keys, md5('x' || year.x || 'y' || year.y || 'dx' || year.dx || 'dy' || year.dy) :: char(32)) as path_keys
          , year.recursion_depth + 1                                                                                            as recursion_depth
        from year1518 year
        join scenarios as next
            on year.x + year.dx = next.x
            and year.y + year.dy = next.y
            and year.stop_key = next.stop_key
        where recursion_depth < 10000
          and list_position(year.path_keys, md5('x' || year.x || 'y' || year.y || 'dx' || year.dx || 'dy' || year.dy)) is null

    )

  , aggregated as (

        select
            stop_key
          , bool_and(list_position(path_keys, md5('x' || x || 'y' || y || 'dx' || dx || 'dy' || dy)) is null) as is_path_unique
        from year1518
        group by 1
    )

select count(stop_key) as result
from aggregated
where is_path_unique is false
