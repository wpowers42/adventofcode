/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    row_number() over ()            as row_id
                  , (row_id - 1) // 7               as schematic_id
                  , regexp_split_to_array(line, '') as line
                  , line                            as raw_line
                from read_csv('./2024/Day 25/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
                where line is not null
            )

          , categorized as (
                select
                    row_id
                  , schematic_id
                  , line
                  , raw_line
                  , case when first_value(raw_line) over (partition by schematic_id order by row_id) = '.....' then 'key' else 'lock' end as type
                from cte
            )

          , tall as (
                select
                    schematic_id
                  , type
                  , unnest(line)                 as indicator
                  , generate_subscripts(line, 1) as position
                from categorized
            )

        select
            schematic_id
          , type
          , position
          , sum((indicator = '#') :: int) - 1 as height
        from tall
        group by 1, 2, 3
    );

/* Part 1 */
select count(distinct keys.schematic_id || '|' || locks.schematic_id) over () as result
from input as keys
join input as locks
    on keys.type = 'key'
    and locks.type = 'lock'
    and keys.position = locks.position
    and keys.height + locks.height <= 5
group by keys.schematic_id, locks.schematic_id
having count(distinct keys.position) = 5
limit 1
