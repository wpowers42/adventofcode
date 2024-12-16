/* DuckDB */
drop table if exists input;
create temp table input as
    (
        with
            cte as (
                select
                    (row_number() over () - 1) // 3                                                       as machine_id
                  , regexp_extract(split_part(regexp_split_to_array(line, ':')[2], ',', 1), '\d+') :: int as x
                  , regexp_extract(split_part(regexp_split_to_array(line, ':')[2], ',', 2), '\d+') :: int as y
                from read_csv('./2024/Day 13/input.txt',
                              header = false,
                              columns = {'line':'varchar'})
                where line is not null
            )

          , grouped as (
                select
                    machine_id
                  , regexp_split_to_array(listagg(x || '|' || y, ','), ',') as instructions
                from cte
                group by 1
            )

        select
            machine_id
          , split_part(instructions[1], '|', 1) :: int as dx_a
          , split_part(instructions[1], '|', 2) :: int as dy_a
          , split_part(instructions[2], '|', 1) :: int as dx_b
          , split_part(instructions[2], '|', 2) :: int as dy_b
          , split_part(instructions[3], '|', 1) :: int as prize_x
          , split_part(instructions[3], '|', 2) :: int as prize_y
        from grouped

    );


/* Part 1 */

drop table if exists spine;
create temp table spine as
    (
        with
            cte as (
                select unnest(generate_series(1, 100)) as n
            )

        select
            a.n as a
          , b.n as b
        from cte a
        cross join cte b
    );


with
    cte as (
        select *
             , a * 3 + b as cost
        from input
        cross join spine
        where dx_a * a + dx_b * b = prize_x
          and dy_a * a + dy_b * b = prize_y
        qualify row_number() over (partition by machine_id order by cost) = 1
    )

select sum(cost) as result
from cte;


/* Part 2 */

/*

Algebraic solution, adapted from conversation with ChatGPT:

WITH Constants AS (
    SELECT
        1000000000000 + 748 AS X_target,
        1000000000000 + 176 AS Y_target
),

MatrixInverse AS (
    -- Precompute determinant and inverse of the matrix
    SELECT
        (26 * 21 - 67 * 66) AS determinant,
        21.0 / (26 * 21 - 67 * 66) AS m11,
       -67.0 / (26 * 21 - 67 * 66) AS m12,
       -66.0 / (26 * 21 - 67 * 66) AS m21,
        26.0 / (26 * 21 - 67 * 66) AS m22
),

Solutions AS (
    -- Solve for a and b using the inverse matrix
    SELECT
        ROUND(m11 * X_target + m12 * Y_target) AS a,
        ROUND(m21 * X_target + m22 * Y_target) AS b
    FROM
        Constants, MatrixInverse
)

SELECT
    a,
    b,
    3 * a + b AS Objective
FROM
    Solutions
WHERE
    a >= 0 AND b >= 0
ORDER BY
    Objective ASC;
*/

with
    cte as (
        select *
             , 10000000000000 + prize_x        as _prize_x
             , 10000000000000 + prize_y        as _prize_y
             , (dx_a * dy_b - dx_b * dy_a)     as determinant
             , dy_b * 1.0 / determinant        as m11
             , -dx_b * 1.0 / determinant       as m12
             , -dy_a * 1.0 / determinant       as m21
             , dx_a * 1.0 / determinant        as m22
             , m11 * _prize_x + m12 * _prize_y as a
             , m21 * _prize_x + m22 * _prize_y as b
            /* Trial and error to find the right allowance */
             , abs(a - round(a)) < 0.001       as a_is_valid
             , abs(b - round(b)) < 0.001       as b_is_valid
             , a_is_valid and b_is_valid       as is_valid
             , a * 3 + b                       as cost
        from input
    )

select sum(cost) as result
from cte
where is_valid;
