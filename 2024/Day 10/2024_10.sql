/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    row_number() over ()            as y
                  , regexp_split_to_array(line, '') as line
                from read_csv('./2024/Day 10/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            generate_subscripts(line, 1) as x
          , y
          , unnest(line) :: int          as height
        from cte
    );

/* Part 1 & 2 */
drop table if exists dirs;
create temp table dirs as
    (
        select
            unnest([[-1, 0], [0, -1], [1, 0], [0, 1]]) as dirs
          , dirs[1]                                    as dx
          , dirs[2]                                    as dy
    );

with
    recursive
    paths as (
        /* Base case */
        select
            x || '|' || y as trailhead
          , x
          , y
          , height
        from input
        where height = 0

        /* Recursive case */
        union all
        select
            trailhead
          , input.x
          , input.y
          , input.height
        from paths
        cross join dirs
        join input
            on paths.x + dirs.dx = input.x
            and paths.y + dirs.dy = input.y
            and paths.height + 1 = input.height
    )

  , grouped as (
        select
            trailhead
          , count(distinct x || '|' || y) as pt1_score
          , count(1)                      as pt2_score
        from paths
        where height = 9
        group by 1
    )

select
    sum(pt1_score) as pt1_result
  , sum(pt2_score) as pt2_result
from grouped;

