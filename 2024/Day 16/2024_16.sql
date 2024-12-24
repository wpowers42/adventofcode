/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    row_number() over ()            as y
                  , regexp_split_to_array(line, '') as line
                from read_csv('./2024/Day 16/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            generate_subscripts(line, 1) :: int as x
          , y
          , unnest(line)                        as cell
        from cte
    );
;

drop table if exists endpoints;
create temp table endpoints as
    (
        select *
        from input
        where cell in ('S', 'E')
    );

drop table if exists dirs;
create temp table dirs as
    (
        select
            unnest([[-1, 0], [0, -1], [1, 0], [0, 1]]) as dirs
          , dirs[1]                                    as dx
          , dirs[2]                                    as dy
          , 1                                          as points
    );

drop table if exists turns;
create temp table turns as
    (
        /* straight */
        select
            dx as dx1
          , dy as dy1
          , dx as dx2
          , dy as dy2
          , points
        from dirs

        union all

        /* left */
        select
            dx
          , dy
          , dy
          , -dx
          , 1001 as points
        from dirs

        union all

        /* right */
        select
            dx
          , dy
          , -dy
          , dx
          , 1001 as points
        from dirs
    );


/* Parts 1 + 2 */


drop
type node;
create
type node as struct(x integer, y integer, points integer, dx integer, dy integer);


with
    recursive
    bfs as (
        /* base case */
        select
            x
          , y
          , 1                                as dx
          , 0                                as dy
          , 0                                as points
          , [(x, y, points, dx, dy) :: node] as visited
          , false                            as reached_end
          , true                             as is_cheapest
        from endpoints
        where cell = 'S'

        /* recursive case */
        union all

        (
            with
                unioned as (
                    select
                        bfs.x + turns.dx2                                                                                     as x
                      , bfs.y + turns.dy2                                                                                     as y
                      , turns.dx2                                                                                             as dx
                      , turns.dy2                                                                                             as dy
                      , bfs.points + turns.points                                                                             as points
                      , list_append(bfs.visited, (input.x, input.y, bfs.points + turns.points, turns.dx2, turns.dy2) :: node) as visited
                      , (input.cell = 'E') :: int                                                                             as reached_end
                    from bfs
                    join turns
                        on bfs.dx = turns.dx1
                        and bfs.dy = turns.dy1
                    join input
                        on bfs.x + turns.dx2 = input.x
                        and bfs.y + turns.dy2 = input.y
                        and input.cell in ('.', 'E')
                    where reached_end is false
                      and is_cheapest is true

                    union all

                    select
                        x
                      , y
                      , dx
                      , dy
                      , points
                      , visited
                      , reached_end
                    from bfs
                    where reached_end is false
                      and is_cheapest is false
                    qualify rank() over (partition by x, y, dx, dy order by points) = 1
                )
              , unnested as (
                    select unnest(visited) as cell
                    from unioned
                )

            select
                x
              , y
              , dx
              , dy
              , points
              , visited
              , max(reached_end) over () :: boolean     as reached_end
              , dense_rank() over (order by points) = 1 as is_cheapest
            from unioned
            where not exists
                      (
                          select 1
                          from unnested
                          where cell.x = unioned.x
                            and cell.y = unioned.y
                            and cell.points < unioned.points
                              /* dx and dy needed for Part 2 and increase execution time from 30 sec --> 12 min */
                            and cell.dx = unioned.dx
                            and cell.dy = unioned.dy
                      )
        )
    )

  , best_paths as (
        select
            points
          , unnest(visited) as nodes
        from bfs
        join endpoints
            on bfs.x = endpoints.x
            and bfs.y = endpoints.y
            and endpoints.cell = 'E'
        where reached_end
        qualify dense_rank() over (order by points) = 1
    )

select
    points                                    as result_part1
  , count(distinct nodes.x || '|' || nodes.y) as result_part2
from best_paths
group by 1
order by 1
;
