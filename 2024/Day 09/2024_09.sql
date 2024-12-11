/* DuckDB */
reset threads;
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select regexp_split_to_array(line, '') as line
                from read_csv('./2024/Day 09/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            generate_subscripts(line, 1)                         as map_id
          , unnest(line) :: int                                  as num_blocks
          , case when map_id % 2 = 0 then 'free' else 'file' end as block_type
          , case when block_type = 'file' then map_id // 2 end   as file_id
        from cte

    );

set variable max_blocks = (select sum(num_blocks) from input where block_type = 'file');

/* Part 1 */
with
    spine as (
        select row_number() over () as n
        from input
        limit 9
    )

  , cte as (
        select
            row_number() over (order by map_id, n)                                            as block_id
          , row_number() over (partition by file_id is not null order by map_id desc, n desc) as reverse_block_id
          , file_id
          , block_id <= getvariable('max_blocks')                                             as is_static
        from input
        join spine
            on input.num_blocks >= spine.n
    )
  , ranked as (
        select *
             , dense_rank() over (partition by file_id is not null order by reverse_block_id desc) as null_rank
             , dense_rank() over (partition by file_id is not null order by block_id desc)         as non_null_rank
        from cte
    )
  , joined as (
        select
            coalesce(a.file_id, b.file_id) as file_id
          , a.block_id
          , a.is_static
        from ranked as a
        left join ranked as b
            on a.null_rank = b.non_null_rank
            and a.file_id is null
            and b.file_id is not null
    )

select sum((block_id - 1) * file_id) as result
from joined
where is_static
;

/* Part 2 */

drop table if exists disk;
create temp table disk as
    (

        with
            spine as (
                select row_number() over () as n
                from input
                limit 9
            )

          , cte as (
                select
                    row_number() over (order by input.map_id, spine.n) as block_id
                  , coalesce(input.file_id :: char, '.')               as file_id
                  , input.num_blocks                                   as num_blocks
                from input
                join spine
                    on input.num_blocks >= spine.n
            )

        select regexp_split_to_array(listagg(file_id, ','), ',') as blocks
        from cte
    );


with
    recursive
    defrag (blocks, file_id) as (
        /* Base case */
        select
            blocks
          , list_reduce(blocks, (x, y) -> greatest(nullif(x, '.') :: int, nullif(y, '.') :: int + 1)) :: varchar as file_id
        from disk

        /* Recursive case */
        union all

        (
            with
                cte as (
                    select
                        /* Next file_id */
                        (file_id :: int - 1) :: varchar                                                           as file_id
                        /* Convert the blocks to a string of . (free space) and 1 (file) */
                      , array_to_string(list_transform(blocks, x -> case when x = '.' then '.' else '1' end), '') as block_string

                        /* Find the first position of the current file_id */
                      , list_position(blocks, file_id)                                                            as block_index

                        /* Split the blocks into three parts: left of the block, the block itself, and right of the block */
                      , list_filter(blocks, x -> x = file_id)                                                     as block_to_move
                      , len(block_to_move)                                                                        as block_size
                      , blocks[1:block_index - 1]                                                                 as _left
                      , blocks[block_index + block_size: - 1] :: varchar[]                                        as _right

                        /* Find the first position to the left of the block that has enough free space */
                      , instr(substring(block_string, 1, block_index), repeat('.', block_size))                   as target

                      , case
                            /* If there is enough free space to the left of the block, move the block to the left */
                            when target > 0 then _left[1:target - 1]
                                                     || block_to_move
                                                     || _left[target + block_size: - 1]
                                                     || regexp_split_to_array(repeat('.', block_size), '')
                                || _right
                            /* Otherwise leave the blocks as is */
                            else blocks
                        end                                                                                       as blocks
                    from defrag
                )

            select
                blocks
              , file_id
            from cte
            where file_id :: int >= 0
        )

    )

  , final_state as (
        select
            unnest(blocks)                     as block
          , generate_subscripts(blocks, 1) - 1 as index
          , nullif(block, '.') :: int * index  as total
        from defrag
        where file_id :: int = 0
    )

select sum(total) as result
from final_state
;





