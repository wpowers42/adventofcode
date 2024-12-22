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

drop table if exists endpoints;
create temp table endpoints as
    (
        select *
        from input
        where cell in ('S', 'E')
    );

update input
set cell = '.'
where cell in ('S', 'E');

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


set variable target_xy = (
    select x || '|' || y
    from endpoints
    where cell = 'E'
    );


/* Parts 1 + 2 */


drop type node;
create type node as struct(x integer, y integer, points integer, dx integer, dy integer);

with
    recursive
    bfs as (
        /* base case */
        select
            x
          , y
          , 1            as dx
          , 0            as dy
          , 0            as points
          , 0            as depth
          , [] :: node[] as visited
          , false        as reached_end
          , false        as has_cheaper_path
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
                      , bfs.depth + 1                                                                                         as depth
                      , list_append(bfs.visited, (input.x, input.y, bfs.points + turns.points, turns.dx2, turns.dy2) :: node) as visited
                      , (input.x || '|' || input.y = getvariable('target_xy')) :: int                                         as reached_end
                    from bfs
                    join turns
                        on bfs.dx = turns.dx1
                        and bfs.dy = turns.dy1
                    join input
                        on bfs.x + turns.dx2 = input.x
                        and bfs.y + turns.dy2 = input.y
                        and input.cell = '.'
                    where reached_end is false
                      and has_cheaper_path is false
                    qualify dense_rank() over (order by bfs.points) = 1

                    union all

                    select
                        bfs.x
                      , bfs.y
                      , bfs.dx
                      , bfs.dy
                      , bfs.points
                      , bfs.depth + 1
                      , bfs.visited
                      , reached_end
                    from bfs
                    where reached_end is false
                      and has_cheaper_path is false
                    qualify dense_rank() over (order by bfs.points) > 1
                        and rank() over (partition by bfs.x, bfs.y, bfs.dx, bfs.dy order by bfs.points) = 1
                )

            select
                a.x
              , a.y
              , a.dx
              , a.dy
              , a.points
              , a.depth
              , a.visited
              , max(max(a.reached_end)) over () :: boolean as reached_end
              , bool_or(b.visited is not null)             as has_cheaper_path
            from unioned as a
            left join unioned as b
                on len(list_filter(b.visited, visited -> a.x = visited.x and a.y = visited.y and a.points > visited.points and a.dx = visited.dx and a.dy = visited.dy)) > 0 /* ???s */
                -- on len(list_filter(b.visited, visited -> a.x = visited.x and a.y = visited.y and a.points > visited.points)) > 0 /* 43s for part 1 */
            group by 1, 2, 3, 4, 5, 6, 7
        )
    )

    -- 75416
  , best_paths as (
        select
            points
          , unnest(visited) as nodes
        from bfs
        where reached_end
    )

select
    points                as result_part1
  , count(distinct nodes) as result_part2
from best_paths
group by 1
order by 1
limit 1
;
