/* DuckDB */
drop table if exists registers;
create temp table registers as
    (
        with
            cte as (
                select
                    regexp_extract(line, '[A-C]')           as register
                  , regexp_extract(line, '(\d+)') :: bigint as register_value
                from read_csv('./2024/Day 17/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
                where line like 'Register%'
            )

        select
            max(case when register = 'A' then register_value end) as a
          , max(case when register = 'B' then register_value end) as b
          , max(case when register = 'C' then register_value end) as c
        from cte
    );

drop table if exists program;
create temp table program
    (
        address int
            primary key,
        opcode int,
        operand int
    );

-- 4,6,3,5,6,3,5,2,1,0
-- 4,6,3,5,6,3,5,2,1,0

insert into program
    (
        with
            cte as (
                select regexp_extract_all(replace(line, ',', '>'), '(\d+>\d+)') as program
                from read_csv('./2024/Day 17/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
                where line like 'Program%'
            )
        select
            (generate_subscripts(program, 1) - 1) * 2     as address
          , split_part(unnest(program), '>', 1) :: bigint as opcode
          , split_part(unnest(program), '>', 2) :: bigint as operand
        from cte
    );

/* Part 1 */

with
    recursive
    execute as (
        /* Base case */
        select
            a
          , b
          , c
          , address         as pointer
          , null :: varchar as output
        from program
        cross join registers
        where program.address = 0

        union all
        /* Recursive case */
        (
            with
                cte as (
                    select
                        case program.opcode
                            when 0 then 'adv'
                            when 1 then 'bxl'
                            when 2 then 'bst'
                            when 3 then 'jnz'
                            when 4 then 'bxc'
                            when 5 then 'out'
                            when 6 then 'bdv'
                            when 7 then 'cdv'
                        end as instruction
                      , case program.operand
                            when 0 then 0
                            when 1 then 1
                            when 2 then 2
                            when 3 then 3
                            when 4 then execute.a
                            when 5 then execute.b
                            when 6 then execute.c
                        end as combo_operand

                      , case instruction
                            when 'adv' then execute.a / power(2, combo_operand)
                            else execute.a
                        end as a
                      , case instruction
                            when 'bxl' then xor(execute.b, program.operand)
                            when 'bst' then combo_operand % 8
                            when 'bxc' then xor(execute.b, execute.c)
                            when 'bdv' then execute.a / power(2, combo_operand)
                            else execute.b
                        end as b
                      , case instruction
                            when 'cdv' then execute.a / power(2, combo_operand)
                            else execute.c
                        end as c
                      , case
                            when instruction = 'jnz' and execute.a != 0 then program.operand
                            else execute.pointer + 2
                        end as pointer
                      , case instruction
                            when 'out' then concat_ws(',', execute.output, combo_operand % 8)
                            else execute.output
                        end as output
                    from execute
                    join program
                        on program.address = execute.pointer
                )

            select
                floor(a) :: bigint as a
              , floor(b) :: bigint as b
              , floor(c) :: bigint as c
              , pointer
              , output
            from cte
        )
    )

select *
from execute;

/*
5,0,3,5,7,6,1,5,4
*/

/* Part 2 */

set variable target = (with
    cte as (
    select regexp_extract_all(line, '(\d+)') as program
    from read_csv('./2024/Day 17/input.txt',
    header = false,
    columns = {'line':'varchar'})
    where line like 'Program%'
    )
    select array_to_string(program, ',') as program
    from cte
    );

drop table if exists a_register_spine;
create temp table a_register_spine as
    (
        -- select unnest(generate_series(410000000, 410000000)) as value
        select unnest(generate_series(10000000, 10000000)) as value
        union all
        select unnest([6, 14, 332])
    );


with
    recursive
    execute as (
        /* Base case */
        select
            a_register_spine.value :: int as a
          , b
          , c
          , address                       as pointer
          , null :: varchar               as output
          , a_register_spine.value :: int as initial_a
          , 0                             as depth
        from program
        cross join a_register_spine
        cross join registers
        where program.address = 0

        union all
        /* Recursive case */
        (
            with
                cte as (
                    select
                        case program.opcode
                            when 0 then 'adv'
                            when 1 then 'bxl'
                            when 2 then 'bst'
                            when 3 then 'jnz'
                            when 4 then 'bxc'
                            when 5 then 'out'
                            when 6 then 'bdv'
                            when 7 then 'cdv'
                        end as instruction
                      , case program.operand
                            when 0 then 0
                            when 1 then 1
                            when 2 then 2
                            when 3 then 3
                            when 4 then execute.a
                            when 5 then execute.b
                            when 6 then execute.c
                        end as combo_operand

                      , case instruction
                            when 'adv' then execute.a / power(2, combo_operand)
                            else execute.a
                        end as a
                      , case instruction
                            when 'bxl' then xor(execute.b, program.operand)
                            when 'bst' then combo_operand % 8
                            when 'bxc' then xor(execute.b, execute.c)
                            when 'bdv' then execute.a / power(2, combo_operand)
                            else execute.b
                        end as b
                      , case instruction
                            when 'cdv' then execute.a / power(2, combo_operand)
                            else execute.c
                        end as c
                      , case
                            when instruction = 'jnz' and execute.a != 0 then program.operand
                            else execute.pointer + 2
                        end as pointer
                      , case instruction
                            when 'out' then concat_ws(',', execute.output, combo_operand % 8)
                            else execute.output
                        end as output
                      , execute.initial_a
                      , execute.depth
                    -- , execute.target
                    from execute
                    join program
                        on program.address = execute.pointer
                )

            select
                floor(a)  as a
              , floor(b)  as b
              , floor(c)  as c
              , pointer
              , output
              , initial_a
              , depth + 1 as depth
            from cte
            -- where output is null
            --    or getvariable('target') like output || '%'
        )
    )

    -- 680440 too low

  , cte as (
        select
            output
          , initial_a as a
        from execute
        qualify row_number() over (partition by initial_a order by depth desc) = 1
    )

select *
     , getvariable('target')
from cte
where getvariable('target') like output || '%'
order by a;


/*
The initial A will be a value between 35.1T and 281.5T. It is not possible to brute force this solution.

35,184,372,088,832
281,474,976,710,656
*/