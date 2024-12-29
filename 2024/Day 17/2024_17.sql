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
          , [] :: integer[] as output
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
                            when 'out' then array_append(execute.output, combo_operand % 8)
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

