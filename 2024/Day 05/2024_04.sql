/* DuckDB */
drop table if exists rules;
create temp table rules as
    (
        with
            cte as (
                select
                    regexp_split_to_array(line, '\|') as pages
                  , pages[1] :: int                   as before
                  , pages[2] :: int                   as after
                from read_csv('./2024/Day 05/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
                where length(line) = 5
            )

        select
            before
          , after
        from cte

    );

drop table if exists updates;
create temp table updates as
    (
        with
            cte as (
                select
                    regexp_split_to_array(line, ',') as updates
                  , row_number() over ()             as update_id
                from read_csv('./2024/Day 05/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
                where length(line) > 5
            )
        select
            update_id
          , unnest(updates) :: int          as page_number
          , generate_subscripts(updates, 1) as update_index
          , updates                         as update_list
        from cte
    );

/* Part 1 */

with
    cte as (
        select
            base.update_id
          , base.page_number
          , base.update_index
          , compare.page_number                                                       as compare_page_number
          , compare.update_index                                                      as compare_update_index
          , bool_or(rules.before is null or compare.update_index > base.update_index) as is_valid
        from updates as base
        join updates as compare
            on base.update_id = compare.update_id
            and base.page_number != compare.page_number
        left join rules
            on base.page_number = rules.before
            and compare.page_number = rules.after
        group by 1, 2, 3, 4, 5
    )
  , valid_updates as (
        select distinct update_id
        from cte
        where true
        qualify bool_and(is_valid) over (partition by update_id)
    )

  , middle_valid_updates as (
        select page_number
        from updates
        where exists
                  (
                      select 1
                      from valid_updates
                      where valid_updates.update_id = updates.update_id
                  )
        qualify update_index * 2 = max(update_index) over (partition by update_id) + 1
    )

select sum(page_number) as result
from middle_valid_updates;


/* Part 2 */

drop table if exists update_rules;
create temp table update_rules as
    (
        /*
        assumptions:
        - for any given list of pages in an update, there can only be one valid ordering
        - the number of times a page appears in the after column is unique per page and
          is directly related to it's order in the list (i.e. higher after count means
          later in the list)
        */
        select
            update_id
          , after
          , count(1) as after_count
        from rules
        join updates
            on rules.before :: varchar = any (updates.update_list)
            and rules.after :: varchar = any (updates.update_list)
        group by 1, 2
    )
;

with
    cte as (
        select
            base.update_id
          , base.page_number
          , base.update_index
          , compare.page_number                                                       as compare_page_number
          , compare.update_index                                                      as compare_update_index
          , bool_or(rules.before is null or compare.update_index > base.update_index) as is_valid
        from updates as base
        join updates as compare
            on base.update_id = compare.update_id
            and base.page_number != compare.page_number
        left join rules
            on base.page_number = rules.before
            and compare.page_number = rules.after
        group by 1, 2, 3, 4, 5
    )
  , invalid_updates as (
        select distinct update_id
        from cte
        where true
        qualify bool_and(is_valid) over (partition by update_id) is false
    )
  , ordered as (
        select
            updates.update_id
          , updates.page_number
          , coalesce(update_rules.after_count, 0)                                                as rank_order
          , (rank_order + 1) * 2 = max(rank_order + 1) over (partition by updates.update_id) + 1 as is_corrected_middle
        from updates
        left join update_rules
            on updates.update_id = update_rules.update_id
            and updates.page_number = update_rules.after
        where updates.update_id in (
            select update_id
            from invalid_updates
        )
    )

select sum(page_number) as result
from ordered
where is_corrected_middle;
