/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    regexp_extract_all(line, '(-?\d+)') as input
                  , input[1] :: int                     as x
                  , input[2] :: int                     as y
                  , input[3] :: int                     as dx
                  , input[4] :: int                     as dy
                from read_csv('./2024/Day 14/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
            )

        select
            x
          , y
          , dx
          , dy
        from cte
    );


set variable width = 101;
set variable height = 103;

/* Part 1 */

with
    cte as (
        select *
             , (x + dx * 100) % getvariable('width')  as x2
             , (y + dy * 100) % getvariable('height') as y2
             , case
                   when x2 < 0 then x2 + getvariable('width')
                   else x2
               end                                    as x3
             , case
                   when y2 < 0 then y2 + getvariable('height')
                   else y2
               end                                    as y3

             , case
                   when x3 > getvariable('width') / 2 then
                       case when y3 > getvariable('height') / 2 then 4 else 2 end
                   else
                       case when y3 > getvariable('height') / 2 then 3 else 1 end
               end
                                                      as quadrant
        from input
        where x3 != (getvariable('width') - 1) / 2
          and y3 != (getvariable('height') - 1) / 2
    )
  , quadrants as (
        select
            quadrant
          , count(1) as num_robots
        from cte
        group by 1
    )


select list_reduce(regexp_split_to_array(listagg(num_robots, ','), ',') :: int[], (a, b) -> a * b) as result
from quadrants
;

/* Part 2 */
drop table if exists frames;
create table frames as
    (
        with
            recursive
            frames as (
                select
                    x
                  , y
                  , dx
                  , dy
                  , 0 as frame
                from input

                union all

                select
                    (x + dx + getvariable('width')) % getvariable('width')   as x
                  , (y + dy + getvariable('height')) % getvariable('height') as y
                  , dx
                  , dy
                  , frame + 1                                                as frame
                from frames
                where frame < 10000
            )
        select *
        from frames
    );

/* Part 2 result determined by frame-by-frame inspection in Jupyter notebook 'visual.ipynb' */