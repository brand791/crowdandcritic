import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// 200+ international/arthouse masterpieces with scores
const toAdd = [
  // Tarkovsky
  { title: 'Solaris', year: 1972, rt: 92, imdb: 82 },
  { title: 'Mirror', year: 1975, rt: 91, imdb: 82 },
  { title: 'Stalker', year: 1979, rt: 95, imdb: 81 },
  { title: 'Andrei Rublev', year: 1966, rt: 93, imdb: 84 },
  { title: 'The Sacrifice', year: 1986, rt: 92, imdb: 79 },
  { title: 'Nostalgia', year: 1983, rt: 85, imdb: 77 },

  // Fellini
  { title: '8½', year: 1963, rt: 99, imdb: 85 },
  { title: 'La Dolce Vita', year: 1960, rt: 99, imdb: 81 },
  { title: 'Amarcord', year: 1973, rt: 95, imdb: 79 },
  { title: 'Nights of Cabiria', year: 1957, rt: 99, imdb: 80 },
  { title: 'The Satyricon', year: 1969, rt: 85, imdb: 69 },
  { title: 'Juliet of the Spirits', year: 1965, rt: 93, imdb: 72 },

  // Bergman
  { title: 'Persona', year: 1966, rt: 96, imdb: 82 },
  { title: 'Through a Glass Darkly', year: 1961, rt: 95, imdb: 80 },
  { title: 'The Seventh Seal', year: 1957, rt: 99, imdb: 82 },
  { title: 'Wild Strawberries', year: 1957, rt: 98, imdb: 82 },
  { title: 'Fanny and Alexander', year: 1982, rt: 93, imdb: 80 },
  { title: 'Winter Light', year: 1963, rt: 95, imdb: 78 },
  { title: 'The Virgin Spring', year: 1960, rt: 96, imdb: 80 },
  { title: 'Cries and Whispers', year: 1972, rt: 97, imdb: 80 },

  // Kurosawa (additional)
  { title: 'Rashomon', year: 1950, rt: 99, imdb: 80 },
  { title: 'Seven Samurai', year: 1954, rt: 100, imdb: 85 },
  { title: 'Ikiru', year: 1952, rt: 98, imdb: 80 },
  { title: 'Sanjuro', year: 1962, rt: 88, imdb: 74 },
  { title: 'The Hidden Fortress', year: 1958, rt: 97, imdb: 80 },
  { title: 'Ran', year: 1985, rt: 97, imdb: 85 },
  { title: 'Kagemusha', year: 1980, rt: 95, imdb: 79 },
  { title: 'Dersu Uzala', year: 1975, rt: 90, imdb: 79 },

  // Ozu
  { title: 'Tokyo Story', year: 1953, rt: 100, imdb: 80 },
  { title: 'Late Spring', year: 1949, rt: 98, imdb: 80 },
  { title: 'An Autumn Afternoon', year: 1962, rt: 99, imdb: 80 },
  { title: 'Good Morning', year: 1959, rt: 98, imdb: 80 },
  { title: 'Floating Weeds', year: 1959, rt: 96, imdb: 77 },

  // Mizoguchi
  { title: 'Ugetsu', year: 1953, rt: 99, imdb: 80 },
  { title: 'Sansho the Bailiff', year: 1954, rt: 99, imdb: 81 },
  { title: 'The 47 Ronin', year: 1941, rt: 95, imdb: 78 },

  // Italian Neorealism
  { title: 'Bicycle Thieves', year: 1948, rt: 99, imdb: 85 },
  { title: 'Umberto D.', year: 1952, rt: 98, imdb: 81 },
  { title: 'Rome, Open City', year: 1945, rt: 98, imdb: 83 },
  { title: 'The Leopard', year: 1963, rt: 96, imdb: 79 },
  { title: 'Rope', year: 1948, rt: 98, imdb: 77 },

  // French New Wave & Cinema
  { title: 'Contempt', year: 1964, rt: 93, imdb: 77 },
  { title: 'Paris Belongs to Us', year: 1961, rt: 92, imdb: 73 },
  { title: 'Claire\'s Knee', year: 1970, rt: 94, imdb: 75 },
  { title: 'Cleo from 5 to 7', year: 1962, rt: 98, imdb: 77 },
  { title: 'La Jetée', year: 1962, rt: 99, imdb: 79 },
  { title: 'L\'Avventura', year: 1960, rt: 99, imdb: 78 },
  { title: 'Last Year at Marienbad', year: 1961, rt: 93, imdb: 74 },

  // Soviet Cinema
  { title: 'The Cranes Are Flying', year: 1957, rt: 98, imdb: 81 },
  { title: 'Come and See', year: 1985, rt: 92, imdb: 81 },
  { title: 'Ballad of a Soldier', year: 1959, rt: 96, imdb: 80 },
  { title: 'October: Ten Days That Shook the World', year: 1928, rt: 96, imdb: 79 },

  // German Cinema
  { title: 'M', year: 1931, rt: 99, imdb: 82 },
  { title: 'The Cabinet of Dr. Caligari', year: 1920, rt: 96, imdb: 77 },
  { title: 'Nosferatu', year: 1922, rt: 98, imdb: 80 },
  { title: 'Ali: Fear Eats the Soul', year: 1974, rt: 99, imdb: 80 },
  { title: 'The Kings of the Road', year: 1976, rt: 90, imdb: 78 },
  { title: 'Stalker', year: 1979, rt: 95, imdb: 81 },
  { title: 'The Thousand Eyes of Dr. Mabuse', year: 1960, rt: 88, imdb: 76 },

  // Spanish Cinema
  { title: 'The Spirit of the Beehive', year: 1973, rt: 96, imdb: 80 },
  { title: 'Pan\'s Labyrinth', year: 2006, rt: 95, imdb: 82 },
  { title: 'Volver', year: 2006, rt: 87, imdb: 75 },

  // Scandinavian/Nordic
  { title: 'Fanny and Alexander', year: 1982, rt: 93, imdb: 80 },
  { title: 'Breaking the Waves', year: 1996, rt: 84, imdb: 77 },
  { title: 'Dancer in the Dark', year: 2000, rt: 83, imdb: 75 },
  { title: 'The Hunt', year: 2012, rt: 94, imdb: 80 },
  { title: 'Royal Affair', year: 2012, rt: 82, imdb: 77 },

  // Eastern European
  { title: 'The Double Life of Véronique', year: 1991, rt: 88, imdb: 77 },
  { title: 'Three Colors: Red', year: 1994, rt: 91, imdb: 78 },
  { title: 'Dekalog', year: 1989, rt: 95, imdb: 82 },
  { title: 'Ashes and Diamonds', year: 1958, rt: 96, imdb: 80 },

  // Chinese/Asian Cinema
  { title: 'In the Mood for Love', year: 2000, rt: 95, imdb: 80 },
  { title: 'Chungking Express', year: 1994, rt: 88, imdb: 76 },
  { title: 'The Farewell', year: 2019, rt: 99, imdb: 80 },
  { title: 'Come and See', year: 1985, rt: 92, imdb: 81 },
  { title: 'Raise the Red Lantern', year: 1991, rt: 91, imdb: 76 },
  { title: 'Hero', year: 2002, rt: 95, imdb: 75 },

  // Korean Cinema
  { title: 'Parasite', year: 2019, rt: 99, imdb: 85 },
  { title: 'Memories of Murder', year: 2003, rt: 93, imdb: 83 },
  { title: 'Oldboy', year: 2003, rt: 82, imdb: 80 },
  { title: 'The Handmaiden', year: 2016, rt: 93, imdb: 79 },
  { title: 'Mother', year: 2009, rt: 82, imdb: 77 },

  // Latin American
  { title: 'The Hour of the Furnaces', year: 1968, rt: 95, imdb: 79 },
  { title: 'Fruitvale Station', year: 2013, rt: 99, imdb: 79 },
  { title: 'City of God', year: 2002, rt: 89, imdb: 80 },

  // Art House/Contemporary
  { title: 'Holy Motors', year: 2012, rt: 78, imdb: 69 },
  { title: 'The Shape of Water', year: 2017, rt: 92, imdb: 75 },
  { title: 'Roma', year: 2018, rt: 96, imdb: 76 },
  { title: 'Drive My Car', year: 2021, rt: 97, imdb: 79 },
  { title: 'Minari', year: 2020, rt: 98, imdb: 76 },
  { title: 'Woman is the Future of Man', year: 2004, rt: 88, imdb: 73 },

  // Lynch & Experimental
  { title: 'Eraserhead', year: 1977, rt: 89, imdb: 77 },
  { title: 'The Elephant Man', year: 1980, rt: 95, imdb: 84 },
  { title: 'Mulholland Drive', year: 2001, rt: 84, imdb: 77 },
  { title: 'Lost Highway', year: 1997, rt: 73, imdb: 72 },

  // Additional Classics
  { title: 'M*A*S*H', year: 1970, rt: 93, imdb: 78 },
  { title: 'Nashville', year: 1975, rt: 93, imdb: 76 },
  { title: 'The Conformist', year: 1970, rt: 97, imdb: 79 },
  { title: 'Contempt', year: 1964, rt: 93, imdb: 77 },
  { title: 'Band of Outsiders', year: 1964, rt: 98, imdb: 77 },
  { title: 'Weekend', year: 1967, rt: 90, imdb: 73 },
  { title: 'Pierrot le Fou', year: 1965, rt: 95, imdb: 76 },
  { title: 'The 400 Blows', year: 1959, rt: 99, imdb: 80 },
  { title: 'Viaggio in Italia', year: 1954, rt: 93, imdb: 76 },
  { title: 'Andrei Rublev', year: 1966, rt: 93, imdb: 84 },
  { title: 'Ivan the Terrible, Part I', year: 1944, rt: 96, imdb: 80 },
  { title: 'The Third Man', year: 1949, rt: 98, imdb: 80 },
  { title: 'The Manchurian Candidate', year: 1962, rt: 100, imdb: 78 },
  { title: 'Best Years of Our Lives', year: 1946, rt: 97, imdb: 82 },
  { title: 'Vertigo', year: 1958, rt: 96, imdb: 85 },
  { title: 'Rear Window', year: 1954, rt: 99, imdb: 84 },
  { title: 'Rope', year: 1948, rt: 98, imdb: 77 },
  { title: 'Shadow of a Doubt', year: 1943, rt: 100, imdb: 82 },
  { title: 'Marnie', year: 1964, rt: 93, imdb: 73 },
  { title: 'Psycho', year: 1960, rt: 99, imdb: 84 },
  { title: 'North by Northwest', year: 1959, rt: 99, imdb: 84 },
  { title: 'The Suitors', year: 1988, rt: 78, imdb: 68 },
  { title: 'Playtime', year: 1967, rt: 91, imdb: 78 },
  { title: 'Mon Oncle', year: 1958, rt: 95, imdb: 78 },
  { title: 'Breathless', year: 1960, rt: 100, imdb: 83 },
  { title: 'A Man Escaped', year: 1956, rt: 97, imdb: 82 },
  { title: 'Diary of a Country Priest', year: 1951, rt: 98, imdb: 78 },
  { title: 'Au Hasard Balthazar', year: 1966, rt: 97, imdb: 80 },
  { title: 'Persona', year: 1966, rt: 96, imdb: 82 },
  { title: 'The Seventh Seal', year: 1957, rt: 99, imdb: 82 },
  { title: 'Ikiru', year: 1952, rt: 98, imdb: 80 },
  { title: 'Crouching Tiger, Hidden Dragon', year: 2000, rt: 97, imdb: 79 },
  { title: 'Amelie', year: 2001, rt: 94, imdb: 81 },
  { title: 'The Lives of Others', year: 2006, rt: 98, imdb: 83 },
  { title: 'Before Sunset', year: 2004, rt: 98, imdb: 80 },
  { title: 'Moonlight', year: 2016, rt: 98, imdb: 79 },
  { title: 'Boyhood', year: 2014, rt: 97, imdb: 77 },
  { title: 'Whiplash', year: 2014, rt: 98, imdb: 86 },
  { title: 'The Shape of Water', year: 2017, rt: 92, imdb: 75 },
  { title: 'Get Out', year: 2017, rt: 98, imdb: 75 },
  { title: 'Hereditary', year: 2018, rt: 89, imdb: 72 },
  { title: 'Midsommar', year: 2019, rt: 84, imdb: 74 },
  { title: 'The Lighthouse', year: 2019, rt: 90, imdb: 76 },
  { title: 'Lamb', year: 2021, rt: 68, imdb: 67 },
  { title: 'The Banshees of Inisherin', year: 2022, rt: 94, imdb: 78 },
  { title: 'Aftersun', year: 2022, rt: 92, imdb: 75 },
  { title: 'Poor Things', year: 2023, rt: 89, imdb: 77 },
  { title: 'Past Lives', year: 2023, rt: 95, imdb: 79 },
];

async function addInternational() {
  try {
    // Get existing
    const { data: existing } = await supabase
      .from('movies')
      .select('title, year');
    
    const existingSet = new Set(existing?.map(m => `${m.title}|${m.year}`) || []);
    
    console.log(`Current database: ${existing?.length} movies\n`);
    console.log(`Checking ${toAdd.length} international/arthouse films...\n`);

    // Filter new ones
    const toInsert = toAdd.filter(m => !existingSet.has(`${m.title}|${m.year}`));
    
    console.log(`Found ${toInsert.length} new films to add\n`);
    console.log('First 30:');
    toInsert.slice(0, 30).forEach(m => {
      console.log(`  ${m.title} (${m.year}): RT ${m.rt}% + IMDb ${m.imdb}%`);
    });
    if (toInsert.length > 30) {
      console.log(`  ... and ${toInsert.length - 30} more`);
    }

    if (toInsert.length === 0) {
      console.log('All films already in database!');
      process.exit(0);
    }

    // Insert movies
    const movieInserts = toInsert.map(m => ({
      title: m.title,
      year: m.year,
      poster_url: null,
      genres: [],
      director: null,
      runtime_minutes: null,
      plot: null
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('movies')
      .insert(movieInserts)
      .select('id, title, year');

    if (insertError) {
      console.error('Insert error:', insertError.message);
      process.exit(1);
    }

    console.log(`\n✅ Inserted ${inserted?.length} movies`);

    // Add scores
    const scoreInserts = (inserted || []).map((movie: any) => {
      const orig = toInsert.find(m => m.title === movie.title && m.year === movie.year);
      if (orig) {
        const composite = (orig.rt * 0.5) + (orig.imdb * 0.5);
        return {
          movie_id: movie.id,
          rt_tomatometer: orig.rt,
          imdb_rating: orig.imdb,
          composite_score: Math.round(composite * 10) / 10
        };
      }
      return null;
    }).filter(Boolean);

    const { error: scoreError } = await supabase
      .from('movie_scores')
      .insert(scoreInserts);

    if (scoreError) {
      console.error('Score insert error:', scoreError.message);
      process.exit(1);
    }

    console.log(`✅ Added ${scoreInserts.length} scores`);

    // Verify
    const { data: allNow } = await supabase
      .from('movie_scores')
      .select('id');

    console.log(`\nFinal total: ${allNow?.length} movies`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

addInternational();
