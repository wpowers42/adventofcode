/* DuckDB */

set variable size = 71; /* Test: 7, Input: 71 */
set variable num_bytes = 1024; /* Test: 14, Input: 1024 */


drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    row_number() over ()     as byte_id
                  , split_part(line, ',', 1) as x
                  , split_part(line, ',', 2) as y
                from read_csv('./2024/Day 18/input.txt',
                              header = false,
                              columns = {'line':'varchar'})

            )
          , spine as (
                select unnest(generate_series(0, getvariable('size') - 1)) as _
            )

        select
            xs._                as x
          , ys._                as y
          , xs._ || '|' || ys._ as key
          , case
                when xs._ = 0 and ys._ = 0 then 'S'
                when xs._ = getvariable('size') - 1 and ys._ = getvariable('size') - 1 then 'E'
                when cte.byte_id is not null then '#'
                else '.'
            end                 as cell
        from spine xs
        cross join spine ys
        left join cte
            on xs._ = cte.x
            and ys._ = cte.y
            and cte.byte_id <= getvariable('num_bytes')
    );

drop table if exists dirs;
create temp table dirs as
    (
        select
            unnest([[-1, 0], [0, -1], [1, 0], [0, 1]]) as dirs
          , dirs[1]                                    as dx
          , dirs[2]                                    as dy
    );


/* Part 1 */
with
    recursive
    bfs as (
        select
            x
          , y
          , cell
          , key
          , [key] :: varchar[]                                        as path
          , 0                                                         as steps
          , false                                                     as is_solved
          , getvariable('size') - 1 - x + getvariable('size') - 1 - y as est_cost
          , 1                                                         as cost_rank
        from input
        where cell = 'S'

        union all

        (
            with
                unioned as (
                    select
                        input.x
                      , input.y
                      , input.cell
                      , input.key
                      , list_append(bfs.path, input.key)                                                  as path
                      , bfs.steps
                      , is_solved
                      , len(path) - 1 + getvariable('size') - 1 - bfs.x + getvariable('size') - 1 - bfs.y as est_cost
                      , null
                    from bfs
                    cross join dirs
                    join input
                        on bfs.x + dirs.dx = input.x
                        and bfs.y + dirs.dy = input.y
                        and input.cell in ('.', 'E')
                        and not list_contains(bfs.path, input.key)
                    where bfs.is_solved is false
                      and bfs.cost_rank = 1

                    union all

                    select bfs.*
                    from bfs
                    where bfs.is_solved is false
                      and cost_rank > 1
                )
              , unnested as (
                    select
                        unnest(path)                 as node
                      , generate_subscripts(path, 1) as step
                    from unioned
                )

              , best as (
                    select
                        split_part(node, '|', 1) :: int as x
                      , split_part(node, '|', 2) :: int as y
                      , min(step - 1)                   as steps
                    from unnested
                    group by 1, 2
                )

            select
                x
              , y
              , cell
              , key
              , path
              , steps + 1 as steps
              , (
                    select max((cell = 'E') :: int)
                    from unioned a
                )         as is_solved
              , est_cost
              , (
                    select count(1)
                    from unioned a
                    where a.est_cost < unioned.est_cost
                ) + 1     as cost_rank
            from unioned
            where not exists
                      (
                          select 1
                          from best
                          where best.x = unioned.x
                            and best.y = unioned.y
                            and best.steps < len(unioned.path) - 1
                      )
            qualify row_number() over (partition by x, y order by est_cost) = 1
        )
    )

select *
     , len(path)
from bfs
-- where is_solved
order by steps desc, est_cost;
and cell = 'E';

-- 282 15s


/* Part 2 */
