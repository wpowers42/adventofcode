/* DuckDB */
drop table if exists patterns;
create temp table patterns as
    (
        select
            unnest(regexp_split_to_array(line, ', ')) as pattern
        from read_csv('./2024/Day 19/input.txt',
                      header = false,
                      columns = {'line':'varchar'})
        where line like '%,%'
    );


drop table if exists designs;
create temp table designs as
    (
        with
            cte as (
                select
                    unnest(regexp_split_to_array(line, ', ')) as design
                from read_csv('./2024/Day 19/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
                where line not like '%,%'
            )

        select *
        from cte
    );


/* Parts 1 + 2 */
with
    recursive
    matches as (
        /* Base case */
        select
            designs.design as original_design
          , designs.design as design
          , 1 :: int64     as num_patterns
        from designs

        /* Recursive case */
        union all

        (
            with
                cte as (
                    select
                        matches.original_design                                                                           as original_design
                      , substring(matches.design, len(patterns.pattern) + 1, len(matches.design) - len(patterns.pattern)) as design
                        /* Count the cumulative product of the number of patterns */
                      , matches.num_patterns * count(1)                                                                   as patterns
                    from matches
                    join patterns
                        on left(matches.design, len(patterns.pattern)) = patterns.pattern
                    group by 1, 2, matches.num_patterns
                )

            select *
            from cte
        )
    )

select
    count(distinct original_design) as result_part1
  , sum(num_patterns)               as result_part2
from matches
where design = '';
