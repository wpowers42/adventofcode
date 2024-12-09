/* DuckDB */
drop table if exists input;
create temp table input as
    (


    );

with
    cte as (
        select
            row_number() over ()            as y
          , regexp_split_to_array(line, '') as line
        from read_csv('./2024/Day 09/test.txt',
                      header = false,
                      columns = {'line':'varchar'})
    )

select *
from cte

/* Part 1 */


/* Part 2 */

