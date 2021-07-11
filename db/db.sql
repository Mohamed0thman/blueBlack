CREATE TABLE Products (
    id INT,
    "name" VARCHAR(50),
    price INT,
    on_sale boolean
);

CREATE TABLE restaurants (
    id BIGSERIAL not null PRIMARY KEY,
    name VARCHAR(50) not null,
    location VARCHAR(50) not null,
    price_range INT not null check(
        price_range >= 1
        and price_range <= 5
    )
);

INSERT INTO
    restaurants (name, location, price_range)
values
    ('macdonalds', 'new yorks', 3);

CREATE TABLE reviews (
    id BIGSERIAL not null PRIMARY KEY,
    restaurant_id BIGINT REFERENCES restaurants(id) not null,
    name VARCHAR(50) not null,
    review text not null,
    rating INT not null check(
        rating >= 1
        and rating <= 5
    )
);

INSERT INTO
    reviews (name, restaurant_id, review, rating)
values
    ('ahmed', 28, 'bad dasdasdasd', 1);

select
    *
from
    restaurants as res
    join reviews as rev on rev.restaurant_id = res.id
where
    res.id = 28;

select
    *
from
    restaurants
    left join (
        select
            restaurant_id,
            count(*),
            TRUNC(avg(rating), 1) as average_rating
        from
            reviews
        group by
            restaurant_id
    ) as reviews on restaurant_id = reviews.restaurant_id;

heroku pg:psql
heroku logs --tail
DROP TABLE categories;

 insert into "public"."categories" (category_name) VALUEs('men');

insert into subcategories (category_id,subcategory_name) VALUEs ('cf4b7eb0-19c5-40e5-85f0-30213a6817ae','shoes');

ALTER TABLE categories
ADD "category" integer;

ALTER TABLE categories DROP COLUMN "order";

ALTER TABLE categories DROP COLUMN category_name
;