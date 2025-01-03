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

  , sequences as (
        select
            buyer_id
          , round
          , secret % 10                                             as bid
          , lag(bid, 4) over (partition by buyer_id order by round) as bid0
          , lag(bid, 3) over (partition by buyer_id order by round) as bid1
          , lag(bid, 2) over (partition by buyer_id order by round) as bid2
          , lag(bid, 1) over (partition by buyer_id order by round) as bid3
          , lag(bid, 0) over (partition by buyer_id order by round) as bid4
          , [bid1 - bid0, bid2 - bid1, bid3 - bid2, bid4 - bid3]    as bids
        from secrets
    )

  , valid_sequences as (
        select
            buyer_id
          , bid
          , bids
        from sequences
        where bid0 is not null
        qualify row_number() over (partition by buyer_id, bids order by round) = 1
    )

select sum(bid) as result
from valid_sequences
group by bids
order by 1 desc
limit 1
;
