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

/* Part 1 */

with
    recursive
    matches as (
        /* Base case */
        select
            designs.design    as original_design
          , designs.design    as design
          , '' :: varchar(64) as patterns
          , 0                 as depth
        from designs

        /* Recursive case */
        union all

        (
            with
                cte as (
                    select
                        matches.original_design                                                                           as original_design
                      , substring(matches.design, len(patterns.pattern) + 1, len(matches.design) - len(patterns.pattern)) as design
                      , matches.patterns || patterns.pattern                                                              as patterns
                      , depth + 1                                                                                         as depth
                    from matches
                    join patterns
                        -- on matches.design like patterns.pattern || '%'
                        on left(matches.design, len(patterns.pattern)) = patterns.pattern
                )

            select *
            from cte
            qualify row_number() over (partition by original_design, patterns) = 1
        )


    )

select count(distinct original_design) as result
from matches
where original_design = patterns;


/* Part 2 */
