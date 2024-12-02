/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            input as (
                select *
                from read_csv('./2024/Day 02/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )
          , split as (
                select
                    split(line, ' ')     as line
                  , row_number() over () as rn
                from input
            )
          , labeled as (
                select
                    rn                  as report_id
                  , unnest(line) :: int as level_value
                  , line                as original
                from split
            )

        select *
             , row_number() over (partition by report_id) as level_id
        from labeled
    );

/* Part 1 */
with
    cte as (
        select *
             , level_value - lag(level_value) over (partition by report_id order by level_id)  as diff__lag
             , lead(level_value) over (partition by report_id order by level_id) - level_value as diff__lead
             , sign(diff__lag) = sign(diff__lead)                                              as is_same_sign
        from input
    )
  , tests as (
        select
            report_id
          , original
          , bool_or(abs(diff__lag) > 3 or abs(diff__lag) < 1 or not is_same_sign) as is_unsafe
        from cte
        group by report_id, original
    )

select count(1) as result
from tests
where not is_unsafe;


/* Part 2 */
with
    number_spine as (
        /* 0-index for keeping all rows */
        select row_number() over () - 1 as n
        from input
        limit 9
    )
  , permutations as (
        select *
             , number_spine.n as index_removed
        from input
        join number_spine
            on input.level_id != number_spine.n
    )

  , cte as (
        select *
             , level_value - lag(level_value) over (partition by report_id, index_removed order by level_id)  as diff__lag
             , lead(level_value) over (partition by report_id, index_removed order by level_id) - level_value as diff__lead
             , sign(diff__lag) = sign(diff__lead)                                                             as is_same_sign
        from permutations
    )
  , tests as (
        select
            report_id
          , index_removed
          , original
          , bool_or(abs(diff__lag) > 3 or abs(diff__lag) < 1 or not is_same_sign) as is_unsafe
        from cte
        group by report_id, original, index_removed
    )

select count(distinct report_id) as result
from tests
where not is_unsafe;