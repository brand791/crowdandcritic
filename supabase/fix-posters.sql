-- Fix broken poster URLs: replace expired Amazon URLs with TMDB posters

UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/d4KNaTrltq6bpkFS01pYtyXa09m.jpg' WHERE imdb_id = 'tt0052357'; -- Vertigo
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' WHERE imdb_id = 'tt0108052'; -- Schindler's List
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg' WHERE imdb_id = 'tt0062622'; -- 2001: A Space Odyssey
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/ILVF0eJg2btjJqHmXXRnQOiXDiQ.jpg' WHERE imdb_id = 'tt0047396'; -- Rear Window
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/8OKmBV5BUFzmozIC3pPWKHy17kx.jpg' WHERE imdb_id = 'tt0047478'; -- Seven Samurai
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/5RUt9QdXjDTJRSQioEMzXsrRpqm.jpg' WHERE imdb_id = 'tt0018455'; -- Sunrise
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/w0UPFX6JEHfZmwDKEJe1ZSvJBp8.jpg' WHERE imdb_id = 'tt0045152'; -- Singin' in the Rain
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg' WHERE imdb_id = 'tt0071562'; -- The Godfather Part II
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/iLWsLVrfkFvOXOG9PbUAYOEtwmk.jpg' WHERE imdb_id = 'tt0046438'; -- Tokyo Story
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/tVxGt7uffLVhIIcwuldXOMpFBPX.jpg' WHERE imdb_id = 'tt0166924'; -- Mulholland Drive
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' WHERE imdb_id = 'tt0099685'; -- GoodFellas
UPDATE movies SET poster_url = 'https://image.tmdb.org/t/p/w500/qbaIVnB5Ib0oMEMnuG9bkvyJEIZ.jpg' WHERE imdb_id = 'tt5052448'; -- Get Out
