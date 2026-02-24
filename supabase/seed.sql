-- CrowdAndCritic Seed Data
-- Run in Supabase SQL Editor after schema.sql

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('The Godfather', 1972, 'tt0068646', 'Francis Ford Coppola', '{"Drama","Crime"}', 175, 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 97, 100, 9.2, 98, 91, 2000000, 14, 98.5, 93.67, 93.33, 51.89, 97.28, 91.22
FROM movies WHERE imdb_id = 'tt0068646'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Citizen Kane', 1941, 'tt0033467', 'Orson Welles', '{"Drama","Mystery"}', 119, 'Following the death of publishing tycoon Charles Foster Kane, reporters scramble to uncover the meaning of his final utterance.', 'https://m.media-amazon.com/images/M/MV5BYjBiOTYxZWItMzdiZi00NjlkLWIzZTYtYmFhZjhiMTljOTdkXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 99, 100, 8.3, 90, 85, 450000, 15, 99.5, 86, 100, 78.84, 87.28, 92.96
FROM movies WHERE imdb_id = 'tt0033467'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Vertigo', 1958, 'tt0052357', 'Alfred Hitchcock', '{"Mystery","Romance","Thriller"}', 128, 'A former San Francisco police detective juggles wrestling with his acrophobia and becoming obsessed with a mysterious woman.', 'https://m.media-amazon.com/images/M/MV5BYTE4ODEwZDUtNDFjOC00NjAxLWEzYTQtYTI1NGVmZmFlNjdiXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 95, 100, 8.3, 84, 86, 430000, 14, 97.5, 84.33, 93.33, 61.82, 86.97, 88.54
FROM movies WHERE imdb_id = 'tt0052357'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Casablanca', 1942, 'tt0034583', 'Michael Curtiz', '{"Drama","Romance","War"}', 102, 'A cynical expatriate American cafe owner struggles to decide whether or not to help his former lover and her fugitive husband escape the Nazis.', 'https://m.media-amazon.com/images/M/MV5BY2IzZGY2YmEtYzljNS00NTM5LTgwMzUtMzM1NjQ4NGI0OTk0XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 99, 100, 8.5, 95, 88, 600000, 13, 99.5, 89.33, 86.67, 79.31, 89.21, 90.7
FROM movies WHERE imdb_id = 'tt0034583'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Schindler''s List', 1993, 'tt0108052', 'Steven Spielberg', '{"Biography","Drama","History"}', 195, 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.', 'https://m.media-amazon.com/images/M/MV5BNDE4OTU5OTgtMmIwNi00YjlmLWI0ZjAtZDE1NDdiMzg4YzFlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 98, 94, 9, 98, 92, 1400000, 10, 96, 93.33, 66.67, 31.24, 94.89, 81.41
FROM movies WHERE imdb_id = 'tt0108052'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('2001: A Space Odyssey', 1968, 'tt0062622', 'Stanley Kubrick', '{"Adventure","Sci-Fi"}', 149, 'After discovering a mysterious artifact buried beneath the Lunar surface, mankind sets off on a quest to find its origins.', 'https://m.media-amazon.com/images/M/MV5BMmNlYzRiNDctZWNhMi00MzI4LThkZTctZTdjZWIyOWYyNzIyXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 92, 84, 8.3, 89, 86, 730000, 13, 88, 86, 86.67, 50.46, 90.52, 83.67
FROM movies WHERE imdb_id = 'tt0062622'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Rear Window', 1954, 'tt0047396', 'Alfred Hitchcock', '{"Mystery","Thriller"}', 112, 'A photographer confined to a wheelchair suspects a neighbor has committed murder.', 'https://m.media-amazon.com/images/M/MV5BNGUxYWM3M2MtMGM3Mi00ZmRiLWE2NDgtZjdlNWI5ZjFjZTE4XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 98, 100, 8.5, 95, 90, 460000, 11, 99, 90, 73.33, 68.04, 87.43, 86.08
FROM movies WHERE imdb_id = 'tt0047396'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Seven Samurai', 1954, 'tt0047478', 'Akira Kurosawa', '{"Action","Adventure","Drama"}', 207, 'A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.', 'https://m.media-amazon.com/images/M/MV5BNOWF4ZjJiOTQtNWZjOS00ZThhLTk3MDMtMWRmZTMwZjYxZTM4XkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 100, 98, 8.6, 97, 91, 380000, 13, 99, 91.33, 86.67, 68.52, 86.15, 89.67
FROM movies WHERE imdb_id = 'tt0047478'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Sunrise: A Song of Two Humans', 1927, 'tt0018455', 'F.W. Murnau', '{"Drama","Romance"}', 94, 'A married farmer falls under the spell of a city woman who tries to convince him to murder his wife.', 'https://m.media-amazon.com/images/M/MV5BNTgxMzkzNTQ5OF5BMl5BanBnXkFtZTgwOTk2MjI5MDE@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 98, 100, 8.1, 88, 85, 55000, 12, 99, 84.67, 80, 90.92, 73.19, 87.28
FROM movies WHERE imdb_id = 'tt0018455'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Singin'' in the Rain', 1952, 'tt0045152', 'Stanley Donen, Gene Kelly', '{"Comedy","Musical","Romance"}', 103, 'A silent film production company and cast make a difficult transition to sound films in the late 1920s.', 'https://m.media-amazon.com/images/M/MV5BNjExMTc1NjE0N15BMl5BanBnXkFtZTgwMzEyMTIxMDE@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 100, 99, 8.3, 90, 87, 280000, 12, 99.5, 86.67, 80, 68.88, 84.1, 86.82
FROM movies WHERE imdb_id = 'tt0045152'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Psycho', 1960, 'tt0054215', 'Alfred Hitchcock', '{"Horror","Mystery","Thriller"}', 109, 'A secretary on the run embezzles money from her employer and checks into a remote motel run by a secretive young man.', 'https://m.media-amazon.com/images/M/MV5BNTQwNDM1YzItNDAxZC00NWY2LTk0M2UtNDIwNWI5OGUyNWUxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 96, 97, 8.5, 93, 89, 700000, 11, 96.5, 89, 73.33, 61.22, 90.24, 84.68
FROM movies WHERE imdb_id = 'tt0054215'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('The Godfather Part II', 1974, 'tt0071562', 'Francis Ford Coppola', '{"Crime","Drama"}', 202, 'The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son Michael expands his grip on the family crime syndicate.', 'https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWRiLTIyMDUtMTI1ZGQwMmEwZjViXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 97, 90, 9, 97, 92, 1300000, 10, 93.5, 93, 66.67, 48.49, 94.39, 82.26
FROM movies WHERE imdb_id = 'tt0071562'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Tokyo Story', 1953, 'tt0046438', 'Yasujiro Ozu', '{"Drama"}', 136, 'An aging couple travels to Tokyo to visit their children, but they are largely ignored.', 'https://m.media-amazon.com/images/M/MV5BYWQ4ZTRhODMtNGMzMC00ZDcwLThkMmItMzU3YWRiNjljZTQzXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 100, 100, 8.2, 93, 88, 100000, 13, 100, 87.67, 86.67, 68.5, 77.19, 88.15
FROM movies WHERE imdb_id = 'tt0046438'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Mulholland Drive', 2001, 'tt0166924', 'David Lynch', '{"Drama","Mystery","Thriller"}', 147, 'After a car wreck on Mulholland Drive renders a woman amnesiac, she and a Hollywood hopeful uncover a dark conspiracy.', 'https://m.media-amazon.com/images/M/MV5BZjM4ZTgwNDItYmU3OS00N2YyLWE3ZWYtMjBiNGFiMGFjNTBjXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 83, 84, 7.9, 83, 82, 440000, 10, 83.5, 81.33, 66.67, 20.6, 87.13, 72.82
FROM movies WHERE imdb_id = 'tt0166924'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Apocalypse Now', 1979, 'tt0078788', 'Francis Ford Coppola', '{"Drama","War"}', 153, 'A U.S. Army officer serving in Vietnam is tasked with assassinating a renegade Special Forces Colonel who sees himself as a god.', 'https://m.media-amazon.com/images/M/MV5BMDdhODg0MjYtYzBiOS00ZmI5LWEwZGYtZDEyNDU4MmQyNzFkXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 98, 94, 8.4, 94, 89, 700000, 11, 96, 89, 73.33, 43.47, 90.24, 82.75
FROM movies WHERE imdb_id = 'tt0078788'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('The Dark Knight', 2008, 'tt0468569', 'Christopher Nolan', '{"Action","Crime","Drama"}', 152, 'When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests of his ability to fight injustice.', 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 94, 84, 9, 94, 87, 2800000, 6, 89, 90.33, 40, 16.14, 99.54, 70.85
FROM movies WHERE imdb_id = 'tt0468569'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Pulp Fiction', 1994, 'tt0110912', 'Quentin Tarantino', '{"Crime","Drama"}', 154, 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 92, 94, 8.9, 96, 93, 2100000, 8, 93, 92.67, 53.33, 29.71, 97.61, 77.13
FROM movies WHERE imdb_id = 'tt0110912'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('GoodFellas', 1990, 'tt0099685', 'Martin Scorsese', '{"Biography","Crime","Drama"}', 146, 'The story of Henry Hill and his life in the mob, covering his relationship with his wife and his mob partners.', 'https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDItZTVmMi00YzE3LWIwNjQtOWRmNzE0ZDM3ZWYzXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 96, 90, 8.7, 97, 91, 1200000, 9, 93, 91.67, 60, 33.24, 93.86, 78.53
FROM movies WHERE imdb_id = 'tt0099685'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Parasite', 2019, 'tt6751668', 'Bong Joon-ho', '{"Comedy","Drama","Thriller"}', 132, 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 99, 96, 8.5, 90, 88, 900000, 7, 97.5, 87.67, 46.67, 6.48, 91.93, 72.68
FROM movies WHERE imdb_id = 'tt6751668'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

INSERT INTO movies (title, year, imdb_id, director, genres, runtime_minutes, plot, poster_url)
VALUES ('Get Out', 2017, 'tt5052448', 'Jordan Peele', '{"Horror","Mystery","Thriller"}', 104, 'A young African-American visits his white girlfriend s parents for the weekend, where his simmering unease eventually reaches a boiling point.', 'https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc1MTI@._V1_SX300.jpg')
ON CONFLICT (imdb_id) DO UPDATE SET title=EXCLUDED.title, year=EXCLUDED.year;

INSERT INTO movie_scores (movie_id, rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, imdb_votes, canon_appearances, critic_score, audience_score, canon_score, longevity_bonus, popularity_weight, composite_score)
SELECT id, 98, 84, 7.7, 86, 80, 620000, 4, 91, 81, 26.67, 7.74, 89.43, 63.93
FROM movies WHERE imdb_id = 'tt5052448'
ON CONFLICT (movie_id) DO UPDATE SET composite_score=EXCLUDED.composite_score, critic_score=EXCLUDED.critic_score, audience_score=EXCLUDED.audience_score;

