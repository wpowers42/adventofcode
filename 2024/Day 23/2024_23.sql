/* DuckDB */
drop table if exists input;
create temp table input as
    (

        with
            cte as (
                select
                    split_part(line, '-', 1) as c1
                  , split_part(line, '-', 2) as c2
                from read_csv('./2024/Day 23/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            c1
          , c2
        from cte

        union all

        select
            c2
          , c1
        from cte
    );

/* Parts 1 + 2 */

-- Execution Time: 50s
with
    recursive
    lan as (
        select distinct list_sort([c1, c2]) as nodes
        from input

        union all

        (
            with
                cte as (
                    select
                        lan.nodes
                      , unnest(lan.nodes) as node
                    from lan
                )

              , joined as (
                    select
                        cte.nodes
                      , input.c2
                      , count(input.c2) as matches
                    from cte
                    left join input
                        on cte.node = input.c1
                        and not list_contains(cte.nodes, input.c2)
                    group by 1, 2
                )

            select distinct array_sort(list_append(nodes, c2)) as nodes
            from joined
            where matches = len(nodes)
        )
    )


select
    'Part 1'     as part
  , count(nodes) as solution
from lan
where len(list_filter(nodes, x -> x like 't%')) > 0
  and len(nodes) = 3
group by 1

union all

(
    select distinct
        'Part 2'                    as part
      , array_to_string(nodes, ',') as solution_part2
    from lan
    order by len(nodes) desc
    limit 1
);
