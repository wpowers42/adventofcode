/* DuckDB */
drop table if exists input;
create table input
    (
        x int,
        y int,
        cell varchar,
        id varchar,
        primary key (x, y)
    );

insert into input
    (

        with
            cte as (
                select
                    row_number() over ()            as y
                  , regexp_split_to_array(line, '') as line
                from read_csv('./2024/Day 20/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            generate_subscripts(line, 1) as x
          , y
          , unnest(line)                 as cell
          , '[' || x || '|' || y || ']'  as id
        from cte
    );

drop table if exists dirs;
create table dirs as
    (
        select
            unnest([[-1, 0], [0, -1], [1, 0], [0, 1]]) as dirs
          , dirs[1]                                    as dx
          , dirs[2]                                    as dy
    );

/* Part 1 */

/* This completed in 6h 58m */
with
    recursive
    paths as (
        select
            x
          , y
          , cell
          , '' :: varchar as path
          , '' :: varchar as cheats
        from input
        where cell = 'S'

        union all

        select
            input.x
          , input.y
          , input.cell
          , paths.path || input.id
          , case
                when input.cell = '#' then paths.cheats || input.id
                when input.cell in ('.', 'E') and len(paths.cheats) - len(replace(paths.cheats, '|', '')) = 1 then paths.cheats || input.id
                else paths.cheats
            end as cheats
        from paths
        cross join dirs
        join input
            on paths.x + dirs.dx = input.x
            and paths.y + dirs.dy = input.y
            and len(paths.path) = len(replace(paths.path, input.id, ''))
            and (input.cell in ('.', 'E') or len(paths.cheats) = len(replace(paths.cheats, '|', '')))
        where paths.cell != 'E'
            /* Stop if we have found the shortest path to E with no cheats */
          and not exists
            (
                select 1
                from paths
                where cell = 'E'
                  and len(cheats) = len(replace(cheats, '|', ''))
            )
    )

  , cte as (
        select *
             , len(path) - len(replace(path, '|', ''))                                                 as picoseconds
             , min(case when len(cheats) = len(replace(cheats, '|', '')) then picoseconds end) over () as base_picoseconds
        from paths
        where cell = 'E'
    )

select count(distinct cheats) as result
from cte
where base_picoseconds - picoseconds >= 100
;