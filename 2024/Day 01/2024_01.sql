/* DuckDB */
create temp table input as
    (
        with
            input as (
                select *
                from read_csv('./2024/Day 01/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )
          , split as (
                select split(line, '   ') as line
                from input
            )

        select
            line[1]::int as a
          , line[2]::int as b
        from split
    );

/* Part 1 */
with
    sorted as (
        select *
             , row_number() over (order by a) as rn_a
             , row_number() over (order by b) as rn_b
        from input
    )

select sum(abs(a.a - b.b)) as result
from sorted a
join sorted b
    on a.rn_a = b.rn_b
;

/* Part 2 */
select distinct sum(a.a * count(b.b)) over () as result
from input a
join input b
    on a.a = b.b
group by a.a