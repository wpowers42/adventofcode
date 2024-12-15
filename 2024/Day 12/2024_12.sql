/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    row_number() over ()            as y
                  , regexp_split_to_array(line, '') as line
                from read_csv('./2024/Day 12/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            generate_subscripts(line, 1) :: smallint as x
          , y :: smallint                            as y
          , unnest(line) :: char(1)                  as plant
          , (x || '|' || y) :: char(7)               as xy
        from cte

    );

drop index if exists idx_input_xy;
create index idx_input_xy on input(x, y);
drop index if exists idx_input_xy_plant;
create index idx_input_xy_plant on input(x, y, plant);

/* Part 1 */
drop table if exists dirs;
create temp table dirs as
    (
        select
            unnest([[-1, 0], [0, -1], [1, 0], [0, 1]]) as dir
          , dir[1]                                     as dx
          , dir[2]                                     as dy
    );

with
    recursive
    flood as (
        /* Base case */
        select
            source.x
          , source.y
          , source.plant
          , source.xy       as source_xy
          , target.xy       as target_xy
          , [] :: char(7)[] as visited
          , 0               as depth
        from input as source
        join input as target
            on source.plant = target.plant
            and source.xy <= target.xy

        /* Recursive case */
        union all

        select
            flood.x + dirs.dx
          , flood.y + dirs.dy
          , flood.plant
          , flood.source_xy
          , flood.target_xy
          , list_prepend(neighbor.xy, flood.visited)
          , depth + 1
        from flood
        cross join dirs
        join input as neighbor
            on flood.x + dirs.dx = neighbor.x
            and flood.y + dirs.dy = neighbor.y
            and flood.plant = neighbor.plant
            and list_contains(flood.visited, neighbor.xy) is false
        where flood.depth < 19600
          and flood.x || '|' || flood.y != flood.target_xy
    )

  , grouped as (
        select
            source_xy
          , plant
          , list_distinct(list_sort(regexp_split_to_array(source_xy || '-' || listagg(target_xy, '-'), '-'))) as targets
        from flood
        where x || '|' || y = target_xy
        group by 1, 2
    )
  , deduped as (
        select distinct targets
        from grouped
    )

  , borders as (
        select
            input.xy
          , input.plant
          , neighbor.plant
          , input.x + dirs.dx || '|' || input.y + dirs.dy as xy2
          , input.plant != coalesce(neighbor.plant, '')   as has_fence
        from input
        cross join dirs
        left join input as neighbor
            on input.x + dirs.dx = neighbor.x
            and input.y + dirs.dy = neighbor.y
    )
  , fences as (
        select
            split_part(xy, '|', 1) as x
          , split_part(xy, '|', 2) as y
          , sum(has_fence :: int)  as num_fences
        from borders
        group by 1, 2
    )

  , tall as (
        select
            split_part(unnest(targets), '|', 1) as x
          , split_part(unnest(targets), '|', 2) as y
          , row_number() over ()                as plot_id
        from deduped
    )

select
    tall.plot_id
  , count(tall.plot_id)        as _num_squares
  , sum(fences.num_fences)     as _num_fences
  , _num_fences * _num_squares as plot_score
  , sum(plot_score) over ()    as result
from tall
join fences
    on tall.x = fences.x
    and tall.y = fences.y
group by 1


/* Part 2 */

