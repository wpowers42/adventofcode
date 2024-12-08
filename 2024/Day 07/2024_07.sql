/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    row_number() over ()                                  as equation_id
                  , split_part(line, ': ', 1) :: bigint                   as result
                  , regexp_split_to_array(split_part(line, ': ', 2), ' ') as values
                from read_csv('./2024/Day 07/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            equation_id
          , result
          , unnest(values) :: bigint       as value
          , generate_subscripts(values, 1) as value_index
          , array_length(values)           as value_count
        from cte

    );

/* Part 1 */
with
    recursive
    equations as (
        select
            equation_id
          , result
          , value
          , value_index
          , value_count
          , 1 as equation_depth
        from input
        where value_index = 1

        union all
        (
            select
                equations.equation_id
              , equations.result
              , case op
                when 'x' then equations.value * input.value
                when '+' then equations.value + input.value
                end
              , input.value_index
              , equations.value_count
              , equations.equation_depth + 1 as equation_depth
            from equations
            join input
                on equations.equation_id = input.equation_id
                and equations.value_index = input.value_index - 1
                cross join (select unnest(['x', '+']) as op)
        )
    )
select sum(max("value")) over () as result
from equations
where equation_depth = value_count
  and result = "value"
group by equation_id
limit 1;


/* Part 2 */
with
    recursive
    equations as (
        select
            equation_id
          , result
          , value
          , value_index
          , value_count
          , 1 as equation_depth
        from input
        where value_index = 1

        union all
        (
            select
                equations.equation_id
              , equations.result
                            , case op
                when 'x' then equations.value * input.value
                when '+' then equations.value + input.value
                when '|' then (equations.value || input.value) :: bigint
                end
              , input.value_index
              , equations.value_count
              , equations.equation_depth + 1 as equation_depth
            from equations
            join input
                on equations.equation_id = input.equation_id
                and equations.value_index = input.value_index - 1
                cross join (select unnest(['x', '+', '|']) as op)

        )
    )
select sum(max("value")) over () as result
from equations
where equation_depth = value_count
  and result = "value"
group by equation_id
limit 1;
