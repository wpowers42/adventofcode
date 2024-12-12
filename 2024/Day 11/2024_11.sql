/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    row_number() over ()             as y
                  , regexp_split_to_array(line, ' ') as line
                from read_csv('./2024/Day 11/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            generate_subscripts(line, 1) as index
          , unnest(line)                 as n
        from cte

    );

/* Part 1 & 2 */
with
    recursive
    line as (
        select
            n
          , 1 :: bigint as copies
          , 0           as depth
        from input
        union all

        (
            with
                cte as (
                    select
                        n
                      , sum(copies) as copies
                      , depth
                    from line
                    where depth <= 75
                      and n is not null
                    group by 1, 3
                )

            select
                case
                    when n = '0' then '1'
                    when len(n) % 2 = 0 then coalesce(nullif(ltrim(n[1:len(n) / 2], '0'), ''), '0')
                    else (n :: bigint * 2024) :: varchar
                end
              , copies
              , depth + 1
            from cte

            union all

            select
                case
                    when len(n) % 2 = 0 then coalesce(nullif(ltrim(n[len(n) / 2 + 1:], '0'), ''), '0')
                end
              , copies
              , depth + 1
            from cte
        )
    )

select
    depth
  , sum(copies) as result
from line
where depth in (25, 75)
  and n is not null
group by 1
order by 1
;