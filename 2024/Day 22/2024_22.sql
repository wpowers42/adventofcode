/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    row_number() over () as buyer_id
                  , line :: int          as secret
                from read_csv('./2024/Day 22/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select *
        from cte
    );


/* Part 1 */
with
    recursive
    secrets as (
        select
            buyer_id
          , secret :: bigint as secret
          , 0                as round
        from input

        union all

        (
            with
                cte as (
                    select
                        buyer_id
                      , xor(secret, secret * 64) % 16777216        as a
                      , xor(a, floor(a / 32) :: bigint) % 16777216 as b
                      , xor(b, b * 2048) % 16777216                as secret
                      , round + 1                                  as round
                    from secrets
                )

            select
                buyer_id
              , secret
              , round
            from cte
            where round < 2001
        )
    )


select sum(secret) as result
from secrets
where round = 2000;


/* Part 2 */

