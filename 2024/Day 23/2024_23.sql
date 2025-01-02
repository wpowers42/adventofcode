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


/* Part 1 */
with
    cte as (
        select
            a.c1
          , a.c2
          , c.c2 as c3
        from input as a
        join input as b
            on a.c1 = b.c1
        join input as c
            on a.c2 = c.c1
            and b.c2 = c.c2
    )

  , deduped as (
        select distinct
            list_sort([c1, c2, c3]) as result
        from cte
        where c1 like 't%'
    )

select count(1) as solution
from deduped;

/* Part 2 */

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

select distinct array_to_string(nodes, ',') as solution
from lan
order by len(nodes) desc
limit 1;
