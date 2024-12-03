/* DuckDB */
drop table if exists input;
create temp table input as
    (
        select group_concat(line, '') as line
        from read_csv('./2024/Day 03/input.txt',
                      header = false,
                      columns = {'line':'varchar'})
    );

/* Part 1 */
with
    cleaned as (
        select regexp_extract_all(line, 'mul\(\d{1,3},\d{1,3}\)') as line
        from input
    )

  , tall as (
        select
            unnest(line)                               as instruction
          , regexp_extract_all(instruction, '\d{1,3}') as ints
          , ints[1] :: int                             as a
          , ints[2] :: int                             as b
        from cleaned
    )

select sum(a * b) as result
from tall;


/* Part 2 */
with
    enabled as (
        select
            regexp_replace(line, '(don''t\(\).*?do\(\))', '', 'g') as line
        from input
    )

  , cleaned as (
        select regexp_extract_all(line, 'mul\(\d{1,3},\d{1,3}\)') as line
        from enabled
    )
  , tall as (
        select
            unnest(line)                               as instruction
          , regexp_extract_all(instruction, '\d{1,3}') as ints
          , ints[1] :: int                             as a
          , ints[2] :: int                             as b
        from cleaned
    )

select sum(a * b) as result
from tall;
