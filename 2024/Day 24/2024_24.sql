/* DuckDB */
drop table if exists input;
create temp table input as
    (
        select line
        from read_csv('./2024/Day 24/input.txt',
                      header = false,
                      columns = {'line':'varchar'})
    );


drop table if exists initial_values;
create temp table initial_values as
    (

        select
            split_part(line, ': ', 1)        as gate
          , split_part(line, ': ', 2) :: int as value
        from input
        where line like '%:%'

        union all

        select distinct
            split_part(line, ' -> ', 2) as output
          , null :: int
        from input
        where line like '%->%'

    );

drop table if exists logic;
create temp table logic as
    (
        select
            split_part(line, ' -> ', 2) as output
          , split_part(line, ' ', 1)    as inputA
          , split_part(line, ' ', 3)    as inputB
          , split_part(line, ' ', 2)    as op
        from input
        where line like '%->%'
    );


/* Part 1 */
with
    recursive
    cte as (
        select
            gate
          , value
          , 0 as depth
        from initial_values

        union all

        select
            cte.gate
          , case
                when logic.output is null then cte.value
                when logic.op = 'AND' then a.value & b.value
                when logic.op = 'OR' then a.value | b.value
                when logic.op = 'XOR' then xor(a.value, b.value)
            end as value
          , cte.depth + 1
        from cte
        left join logic
            on logic.output = cte.gate
        left join cte a
            on logic.inputA = a.gate
        left join cte b
            on logic.inputB = b.gate
        where exists
                  (
                      select 1
                      from cte
                      where value is null
                  )
    )

  , final as (
        select
            gate
          , value
        from cte
        where gate like 'z%'
        qualify depth = max(depth) over ()
    )

select ('0b' || array_to_string(list(value order by gate desc), '')) :: bigint as result
from final;

/* Part 2 */

