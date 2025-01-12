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
drop table if exists combinations;
create table combinations as
    (
        with
            recursive
            cte as (
                select
                    [output]         as outputs
                  , [inputA, inputB] as gates
                from logic

                union all

                select
                    list_append(cte.outputs, logic.output)
                  , list_concat(cte.gates, [logic.inputA, logic.inputB])
                from cte
                join logic
                    on logic.output > cte.outputs[-1]
                    -- and len(list_filter(cte.outputs, x -> x in (logic.inputA, logic.inputA) and x < logic.inputB)) = 0
                    -- 1779360
                    -- and len(list_filter(cte.gates, x -> x in (logic.inputA, logic.inputA) and x < logic.inputB)) = 0
                    -- and len(list_filter(cte.gates, x -> x in (logic.inputA, logic.inputA))) = 0
                    and not list_contains(cte.gates, logic.inputA)
                    and not list_contains(cte.gates, logic.inputB)
                where len(outputs) < 4
            )

        select distinct list_sort(outputs) as outputs
        from cte
        where len(outputs) = 4
    );


drop table if exists permutations;
create table permutations as
    (
        select
            outputs[1] as a1
          , outputs[2] as a2
          , outputs[3] as b1
          , outputs[4] as b2
        from combinations

        union all

        select
            outputs[1] as a1
          , outputs[3] as a2
          , outputs[2] as b1
          , outputs[4] as b2
        from combinations

        union all

        select
            outputs[1] as a1
          , outputs[4] as a2
          , outputs[2] as b1
          , outputs[3] as b2
        from combinations
    );

create table all_logic as
    (
        with
            cte as (
                select
                    row_number() over () as id
                  , a1
                  , a2
                  , b1
                  , b2
                from permutations
            )


        select
            cte.id
          , logic.inputA
          , logic.inputB
          , logic.op
          , case
                when cte.a1 = logic.output then cte.a2
                when cte.a2 = logic.output then cte.a1
                when cte.b1 = logic.output then cte.b2
                when cte.b2 = logic.output then cte.b1
                else logic.output
            end as output
        from cte
        cross join logic
    );

with
    recursive
    cte as (
        select
            id
          , gate
          , value
          , 0 as depth
        from initial_values
        cross join (
            select row_number() over () as id
            from permutations
            limit 10
        )

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