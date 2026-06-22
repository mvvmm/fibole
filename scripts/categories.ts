export interface Category {
  name: string;
  wikipediaCategory: string;
  entityType: string;
  minMonthlyViews?: number;
}

export const CATEGORIES: Category[] = [
  // === US History & Politics ===
  { name: "US Presidents", wikipediaCategory: "Category:Presidents_of_the_United_States", entityType: "US President" },
  { name: "US Vice Presidents", wikipediaCategory: "Category:Vice_Presidents_of_the_United_States", entityType: "US Vice President" },
  { name: "US Supreme Court Justices", wikipediaCategory: "Category:Associate_Justices_of_the_Supreme_Court_of_the_United_States", entityType: "US Supreme Court Justice" },
  { name: "Founding Fathers", wikipediaCategory: "Category:Founding_Fathers_of_the_United_States", entityType: "Founding Father of the United States" },
  { name: "US Senators", wikipediaCategory: "Category:United_States_senators", entityType: "US Senator", minMonthlyViews: 30000 },

  // === World Leaders ===
  { name: "British Prime Ministers", wikipediaCategory: "Category:Prime_Ministers_of_the_United_Kingdom", entityType: "British Prime Minister" },
  { name: "French Presidents", wikipediaCategory: "Category:Presidents_of_France", entityType: "President of France" },
  { name: "German Chancellors", wikipediaCategory: "Category:Chancellors_of_Germany", entityType: "German Chancellor" },
  { name: "Canadian Prime Ministers", wikipediaCategory: "Category:Prime_Ministers_of_Canada", entityType: "Canadian Prime Minister" },
  { name: "Australian Prime Ministers", wikipediaCategory: "Category:Prime_Ministers_of_Australia", entityType: "Australian Prime Minister" },
  { name: "Popes", wikipediaCategory: "Category:Popes", entityType: "Pope" },

  // === Historical Figures ===
  { name: "Ancient Greek Figures", wikipediaCategory: "Category:Ancient_Greeks", entityType: "ancient Greek figure", minMonthlyViews: 25000 },
  { name: "Roman Emperors", wikipediaCategory: "Category:Roman_emperors", entityType: "Roman emperor" },
  { name: "Pharaohs", wikipediaCategory: "Category:Pharaohs_of_Egypt", entityType: "Egyptian pharaoh" },
  { name: "British Monarchs", wikipediaCategory: "Category:Monarchs_of_England", entityType: "British monarch" },
  { name: "French Monarchs", wikipediaCategory: "Category:French_monarchs", entityType: "French monarch" },
  { name: "Russian Rulers", wikipediaCategory: "Category:Russian_tsars", entityType: "Russian ruler" },
  { name: "Chinese Dynasties", wikipediaCategory: "Category:Chinese_emperors", entityType: "Chinese emperor" },
  { name: "Explorers", wikipediaCategory: "Category:Explorers", entityType: "explorer", minMonthlyViews: 20000 },
  { name: "Conquerors and Warlords", wikipediaCategory: "Category:Military_commanders", entityType: "historical military commander", minMonthlyViews: 30000 },
  { name: "Revolutionary Leaders", wikipediaCategory: "Category:Revolutionary_leaders", entityType: "revolutionary leader", minMonthlyViews: 20000 },
  { name: "Medieval Rulers", wikipediaCategory: "Category:Medieval_rulers", entityType: "medieval ruler", minMonthlyViews: 20000 },
  { name: "Historical Figures", wikipediaCategory: "Category:Historical_figures", entityType: "historical figure", minMonthlyViews: 30000 },
  { name: "Civil Rights Leaders", wikipediaCategory: "Category:Civil_rights_activists", entityType: "civil rights leader", minMonthlyViews: 25000 },
  { name: "American Civil War Figures", wikipediaCategory: "Category:American_Civil_War_people", entityType: "American Civil War figure", minMonthlyViews: 25000 },
  { name: "World War II Figures", wikipediaCategory: "Category:World_War_II_people", entityType: "World War II figure", minMonthlyViews: 30000 },
  { name: "Pirates", wikipediaCategory: "Category:Pirates", entityType: "pirate" },

  // === Scientists & Inventors ===
  { name: "Scientists", wikipediaCategory: "Category:Scientists", entityType: "scientist", minMonthlyViews: 25000 },
  { name: "Physicists", wikipediaCategory: "Category:Physicists", entityType: "physicist", minMonthlyViews: 20000 },
  { name: "Mathematicians", wikipediaCategory: "Category:Mathematicians", entityType: "mathematician", minMonthlyViews: 20000 },
  { name: "Chemists", wikipediaCategory: "Category:Chemists", entityType: "chemist", minMonthlyViews: 20000 },
  { name: "Biologists", wikipediaCategory: "Category:Biologists", entityType: "biologist", minMonthlyViews: 20000 },
  { name: "Astronomers", wikipediaCategory: "Category:Astronomers", entityType: "astronomer", minMonthlyViews: 15000 },
  { name: "Inventors", wikipediaCategory: "Category:Inventors", entityType: "inventor", minMonthlyViews: 20000 },
  { name: "Computer Scientists", wikipediaCategory: "Category:Computer_scientists", entityType: "computer scientist", minMonthlyViews: 20000 },
  { name: "Physicians and Surgeons", wikipediaCategory: "Category:Physicians", entityType: "physician", minMonthlyViews: 20000 },
  { name: "Psychologists", wikipediaCategory: "Category:Psychologists", entityType: "psychologist", minMonthlyViews: 15000 },
  { name: "Nobel Physics Laureates", wikipediaCategory: "Category:Nobel_laureates_in_Physics", entityType: "Nobel Prize-winning physicist" },
  { name: "Nobel Chemistry Laureates", wikipediaCategory: "Category:Nobel_laureates_in_Chemistry", entityType: "Nobel Prize-winning chemist" },
  { name: "Nobel Peace Prize Laureates", wikipediaCategory: "Category:Nobel_Peace_Prize_laureates", entityType: "Nobel Peace Prize laureate" },
  { name: "Nobel Literature Laureates", wikipediaCategory: "Category:Nobel_laureates_in_Literature", entityType: "Nobel Prize-winning author" },
  { name: "Astronauts", wikipediaCategory: "Category:Astronauts", entityType: "astronaut" },

  // === NFL ===
  { name: "NFL Players", wikipediaCategory: "Category:American_football_players", entityType: "NFL player", minMonthlyViews: 25000 },
  { name: "NFL Quarterbacks", wikipediaCategory: "Category:American_football_quarterbacks", entityType: "NFL quarterback", minMonthlyViews: 25000 },
  { name: "NFL Running Backs", wikipediaCategory: "Category:American_football_running_backs", entityType: "NFL running back", minMonthlyViews: 20000 },
  { name: "NFL Wide Receivers", wikipediaCategory: "Category:American_football_wide_receivers", entityType: "NFL wide receiver", minMonthlyViews: 20000 },
  { name: "NFL Coaches", wikipediaCategory: "Category:American_football_coaches", entityType: "NFL coach", minMonthlyViews: 20000 },
  { name: "NFL Defensive Players", wikipediaCategory: "Category:American_football_defensive_linemen", entityType: "NFL defensive player", minMonthlyViews: 20000 },

  // === NBA ===
  { name: "NBA Players", wikipediaCategory: "Category:National_Basketball_Association_players", entityType: "NBA player", minMonthlyViews: 25000 },
  { name: "NBA Coaches", wikipediaCategory: "Category:National_Basketball_Association_coaches", entityType: "NBA coach", minMonthlyViews: 20000 },

  // === MLB ===
  { name: "MLB Players", wikipediaCategory: "Category:Major_League_Baseball_players", entityType: "MLB player", minMonthlyViews: 20000 },
  { name: "MLB Pitchers", wikipediaCategory: "Category:Major_League_Baseball_pitchers", entityType: "MLB pitcher", minMonthlyViews: 20000 },

  // === NHL ===
  { name: "NHL Players", wikipediaCategory: "Category:National_Hockey_League_players", entityType: "NHL player", minMonthlyViews: 20000 },

  // === Soccer ===
  { name: "Soccer Players", wikipediaCategory: "Category:Association_football_players", entityType: "soccer player", minMonthlyViews: 30000 },
  { name: "Soccer Managers", wikipediaCategory: "Category:Association_football_managers", entityType: "soccer manager", minMonthlyViews: 25000 },

  // === Tennis ===
  { name: "Tennis Players", wikipediaCategory: "Category:Tennis_players", entityType: "tennis player", minMonthlyViews: 25000 },
  { name: "Wimbledon Champions", wikipediaCategory: "Category:Wimbledon_champions", entityType: "Wimbledon champion" },

  // === Golf ===
  { name: "Golfers", wikipediaCategory: "Category:Golfers", entityType: "golfer", minMonthlyViews: 25000 },

  // === Boxing & Combat Sports ===
  { name: "Boxers", wikipediaCategory: "Category:Boxers_(sport)", entityType: "boxer", minMonthlyViews: 25000 },
  { name: "Heavyweight Boxing Champions", wikipediaCategory: "Category:World_heavyweight_boxing_champions", entityType: "heavyweight boxing champion" },
  { name: "MMA Fighters", wikipediaCategory: "Category:Mixed_martial_artists", entityType: "MMA fighter", minMonthlyViews: 25000 },
  { name: "Wrestlers", wikipediaCategory: "Category:Professional_wrestlers", entityType: "professional wrestler", minMonthlyViews: 25000 },

  // === Motor Sports ===
  { name: "Formula One Drivers", wikipediaCategory: "Category:Formula_One_drivers", entityType: "Formula One driver", minMonthlyViews: 20000 },
  { name: "NASCAR Drivers", wikipediaCategory: "Category:NASCAR_drivers", entityType: "NASCAR driver", minMonthlyViews: 20000 },

  // === Olympics ===
  { name: "Olympic Athletes", wikipediaCategory: "Category:Olympic_athletes", entityType: "Olympic athlete", minMonthlyViews: 20000 },
  { name: "Olympic Sprinters", wikipediaCategory: "Category:Olympic_sprinters", entityType: "Olympic sprinter", minMonthlyViews: 15000 },
  { name: "Olympic Swimmers", wikipediaCategory: "Category:Olympic_swimmers", entityType: "Olympic swimmer", minMonthlyViews: 15000 },
  { name: "Olympic Gymnasts", wikipediaCategory: "Category:Olympic_gymnasts", entityType: "Olympic gymnast", minMonthlyViews: 15000 },
  { name: "Olympic Figure Skaters", wikipediaCategory: "Category:Olympic_figure_skaters", entityType: "Olympic figure skater", minMonthlyViews: 15000 },

  // === Other Sports ===
  { name: "Cyclists", wikipediaCategory: "Category:Cyclists", entityType: "cyclist", minMonthlyViews: 20000 },
  { name: "Track and Field Athletes", wikipediaCategory: "Category:Track_and_field_athletes", entityType: "track and field athlete", minMonthlyViews: 15000 },
  { name: "Rugby Players", wikipediaCategory: "Category:Rugby_union_players", entityType: "rugby player", minMonthlyViews: 20000 },
  { name: "Cricketers", wikipediaCategory: "Category:Cricketers", entityType: "cricketer", minMonthlyViews: 20000 },
  { name: "Jockeys", wikipediaCategory: "Category:Jockeys", entityType: "horse racing jockey", minMonthlyViews: 15000 },
  { name: "Skiers", wikipediaCategory: "Category:Alpine_skiers", entityType: "alpine skier", minMonthlyViews: 15000 },

  // === Film ===
  { name: "Horror Films", wikipediaCategory: "Category:American_horror_films", entityType: "horror film", minMonthlyViews: 35000 },
  { name: "Science Fiction Films", wikipediaCategory: "Category:American_science_fiction_films", entityType: "science fiction film", minMonthlyViews: 40000 },
  { name: "Comedy Films", wikipediaCategory: "Category:American_comedy_films", entityType: "comedy film", minMonthlyViews: 40000 },
  { name: "Action Films", wikipediaCategory: "Category:American_action_films", entityType: "action film", minMonthlyViews: 40000 },
  { name: "Drama Films", wikipediaCategory: "Category:American_drama_films", entityType: "drama film", minMonthlyViews: 40000 },
  { name: "Romantic Comedy Films", wikipediaCategory: "Category:American_romantic_comedy_films", entityType: "romantic comedy film", minMonthlyViews: 35000 },
  { name: "Crime Films", wikipediaCategory: "Category:American_crime_films", entityType: "crime film", minMonthlyViews: 35000 },
  { name: "Musical Films", wikipediaCategory: "Category:American_musical_films", entityType: "musical film", minMonthlyViews: 35000 },
  { name: "Disney Animated Films", wikipediaCategory: "Category:Walt_Disney_Animation_Studios_films", entityType: "Disney animated film", minMonthlyViews: 40000 },
  { name: "Pixar Films", wikipediaCategory: "Category:Pixar_films", entityType: "Pixar film", minMonthlyViews: 40000 },
  { name: "Animated Films", wikipediaCategory: "Category:Animated_films", entityType: "animated film", minMonthlyViews: 40000 },
  { name: "Superhero Films", wikipediaCategory: "Category:Superhero_films", entityType: "superhero film", minMonthlyViews: 50000 },
  { name: "Film Directors", wikipediaCategory: "Category:Film_directors", entityType: "film director", minMonthlyViews: 30000 },
  { name: "Hollywood Actors", wikipediaCategory: "Category:American_film_actors", entityType: "actor", minMonthlyViews: 40000 },
  { name: "British Actors", wikipediaCategory: "Category:English_actors", entityType: "British actor", minMonthlyViews: 30000 },
  { name: "Academy Award Winners", wikipediaCategory: "Category:Academy_Award_winners", entityType: "Academy Award winner", minMonthlyViews: 40000 },

  // === Music ===
  { name: "Music Groups (60s)", wikipediaCategory: "Category:Musical_groups_established_in_the_1960s", entityType: "music group from the 1960s", minMonthlyViews: 30000 },
  { name: "Music Groups (70s)", wikipediaCategory: "Category:Musical_groups_established_in_the_1970s", entityType: "music group from the 1970s", minMonthlyViews: 30000 },
  { name: "Music Groups (80s)", wikipediaCategory: "Category:Musical_groups_established_in_the_1980s", entityType: "music group from the 1980s", minMonthlyViews: 30000 },
  { name: "Music Groups (90s)", wikipediaCategory: "Category:Musical_groups_established_in_the_1990s", entityType: "music group from the 1990s", minMonthlyViews: 30000 },
  { name: "Music Groups (2000s)", wikipediaCategory: "Category:Musical_groups_established_in_the_2000s", entityType: "music group from the 2000s", minMonthlyViews: 30000 },
  { name: "Music Groups (2010s)", wikipediaCategory: "Category:Musical_groups_established_in_the_2010s", entityType: "music group from the 2010s", minMonthlyViews: 30000 },
  { name: "Rock Bands", wikipediaCategory: "Category:Rock_music_groups", entityType: "rock band", minMonthlyViews: 40000 },
  { name: "Indie Rock Bands", wikipediaCategory: "Category:Indie_rock_musical_groups", entityType: "indie rock band", minMonthlyViews: 25000 },
  { name: "Hip Hop Artists", wikipediaCategory: "Category:Hip_hop_musicians", entityType: "hip hop artist", minMonthlyViews: 40000 },
  { name: "Rap Artists", wikipediaCategory: "Category:Rappers", entityType: "rap artist", minMonthlyViews: 40000 },
  { name: "K-pop Groups", wikipediaCategory: "Category:South_Korean_idol_groups", entityType: "K-pop group", minMonthlyViews: 30000 },
  { name: "Latin Music Artists", wikipediaCategory: "Category:Latin_Grammy_Award_winners", entityType: "Latin music artist", minMonthlyViews: 35000 },
  { name: "Electronic Musicians", wikipediaCategory: "Category:Electronic_music_artists", entityType: "electronic music artist", minMonthlyViews: 30000 },
  { name: "Classical Composers", wikipediaCategory: "Category:Classical_period_composers", entityType: "classical composer", minMonthlyViews: 20000 },
  { name: "Baroque Composers", wikipediaCategory: "Category:Baroque_composers", entityType: "Baroque composer", minMonthlyViews: 15000 },
  { name: "Romantic Era Composers", wikipediaCategory: "Category:Romantic_composers", entityType: "Romantic era composer", minMonthlyViews: 15000 },
  { name: "Jazz Musicians", wikipediaCategory: "Category:Jazz_musicians", entityType: "jazz musician", minMonthlyViews: 20000 },
  { name: "Country Musicians", wikipediaCategory: "Category:Country_music_musicians", entityType: "country musician", minMonthlyViews: 25000 },
  { name: "Blues Musicians", wikipediaCategory: "Category:Blues_musicians", entityType: "blues musician", minMonthlyViews: 20000 },
  { name: "Pop Musicians", wikipediaCategory: "Category:Pop_musicians", entityType: "pop musician", minMonthlyViews: 40000 },
  { name: "Soul and R&B Musicians", wikipediaCategory: "Category:Rhythm_and_blues_musicians", entityType: "soul and R&B musician", minMonthlyViews: 30000 },
  { name: "Punk Bands", wikipediaCategory: "Category:Punk_rock_groups", entityType: "punk band", minMonthlyViews: 25000 },
  { name: "Heavy Metal Bands", wikipediaCategory: "Category:Heavy_metal_musical_groups", entityType: "heavy metal band", minMonthlyViews: 30000 },
  { name: "Grammy Award Winners", wikipediaCategory: "Category:Grammy_Award_winners", entityType: "Grammy-winning musician", minMonthlyViews: 40000 },
  { name: "Opera Singers", wikipediaCategory: "Category:Opera_singers", entityType: "opera singer", minMonthlyViews: 15000 },
  { name: "Rock and Roll Pioneers", wikipediaCategory: "Category:Rock_and_roll_musicians", entityType: "rock and roll pioneer", minMonthlyViews: 30000 },

  // === Visual Arts ===
  { name: "Painters", wikipediaCategory: "Category:Painters", entityType: "painter", minMonthlyViews: 25000 },
  { name: "Sculptors", wikipediaCategory: "Category:Sculptors", entityType: "sculptor", minMonthlyViews: 20000 },
  { name: "Photographers", wikipediaCategory: "Category:Photographers", entityType: "photographer", minMonthlyViews: 15000 },
  { name: "Renaissance Artists", wikipediaCategory: "Category:Renaissance_painters", entityType: "Renaissance painter", minMonthlyViews: 20000 },
  { name: "Impressionist Painters", wikipediaCategory: "Category:Impressionist_painters", entityType: "Impressionist painter" },
  { name: "Abstract Artists", wikipediaCategory: "Category:Abstract_artists", entityType: "abstract artist", minMonthlyViews: 15000 },

  // === Literature ===
  { name: "Novelists", wikipediaCategory: "Category:Novelists", entityType: "novelist", minMonthlyViews: 25000 },
  { name: "American Authors", wikipediaCategory: "Category:American_novelists", entityType: "American novelist", minMonthlyViews: 25000 },
  { name: "British Authors", wikipediaCategory: "Category:British_novelists", entityType: "British novelist", minMonthlyViews: 25000 },
  { name: "Poets", wikipediaCategory: "Category:Poets", entityType: "poet", minMonthlyViews: 20000 },
  { name: "Playwrights", wikipediaCategory: "Category:Playwrights", entityType: "playwright", minMonthlyViews: 20000 },
  { name: "Science Fiction Authors", wikipediaCategory: "Category:Science_fiction_writers", entityType: "science fiction author", minMonthlyViews: 20000 },
  { name: "Mystery Authors", wikipediaCategory: "Category:Mystery_writers", entityType: "mystery author", minMonthlyViews: 20000 },

  // === Television ===
  { name: "Sitcoms", wikipediaCategory: "Category:American_sitcoms", entityType: "American sitcom", minMonthlyViews: 40000 },
  { name: "Drama TV Series", wikipediaCategory: "Category:American_drama_television_series", entityType: "American drama TV series", minMonthlyViews: 40000 },
  { name: "Reality TV Shows", wikipediaCategory: "Category:American_reality_television_series", entityType: "reality TV show", minMonthlyViews: 35000 },
  { name: "Crime Dramas", wikipediaCategory: "Category:American_crime_drama_television_series", entityType: "crime drama TV series", minMonthlyViews: 35000 },
  { name: "British TV Shows", wikipediaCategory: "Category:British_television_series", entityType: "British TV show", minMonthlyViews: 30000 },
  { name: "Animated TV Shows", wikipediaCategory: "Category:American_animated_television_series", entityType: "animated TV show", minMonthlyViews: 35000 },
  { name: "TV Actors", wikipediaCategory: "Category:American_television_actors", entityType: "television actor", minMonthlyViews: 30000 },
  { name: "Talk Show Hosts", wikipediaCategory: "Category:Talk_show_hosts", entityType: "talk show host", minMonthlyViews: 30000 },
  { name: "Stand-up Comedians", wikipediaCategory: "Category:American_stand-up_comedians", entityType: "stand-up comedian", minMonthlyViews: 30000 },
  { name: "Comedians", wikipediaCategory: "Category:Comedians", entityType: "comedian", minMonthlyViews: 30000 },

  // === Geography — Countries ===
  { name: "Countries", wikipediaCategory: "Category:Member_states_of_the_United_Nations", entityType: "country" },
  { name: "Island Nations", wikipediaCategory: "Category:Island_countries", entityType: "island nation" },
  { name: "African Countries", wikipediaCategory: "Category:Countries_in_Africa", entityType: "African country" },
  { name: "Asian Countries", wikipediaCategory: "Category:Countries_in_Asia", entityType: "Asian country" },
  { name: "European Countries", wikipediaCategory: "Category:Countries_in_Europe", entityType: "European country" },
  { name: "Latin American Countries", wikipediaCategory: "Category:Countries_in_South_America", entityType: "South American country" },
  { name: "Landlocked Countries", wikipediaCategory: "Category:Landlocked_countries", entityType: "landlocked country" },

  // === Geography — Cities ===
  { name: "World Cities", wikipediaCategory: "Category:Cities", entityType: "city", minMonthlyViews: 60000 },
  { name: "Capital Cities", wikipediaCategory: "Category:Capital_cities", entityType: "capital city", minMonthlyViews: 35000 },
  { name: "US Cities", wikipediaCategory: "Category:Cities_in_the_United_States", entityType: "US city", minMonthlyViews: 40000 },
  { name: "European Cities", wikipediaCategory: "Category:Cities_in_Europe", entityType: "European city", minMonthlyViews: 40000 },
  { name: "Asian Cities", wikipediaCategory: "Category:Cities_in_Asia", entityType: "Asian city", minMonthlyViews: 40000 },

  // === Geography — Natural Features ===
  { name: "Mountains", wikipediaCategory: "Category:Mountains", entityType: "mountain", minMonthlyViews: 20000 },
  { name: "Volcanoes", wikipediaCategory: "Category:Volcanoes", entityType: "volcano", minMonthlyViews: 15000 },
  { name: "Rivers", wikipediaCategory: "Category:Rivers", entityType: "river", minMonthlyViews: 20000 },
  { name: "Lakes", wikipediaCategory: "Category:Lakes", entityType: "lake", minMonthlyViews: 20000 },
  { name: "Deserts", wikipediaCategory: "Category:Deserts", entityType: "desert", minMonthlyViews: 20000 },
  { name: "Islands", wikipediaCategory: "Category:Islands", entityType: "island", minMonthlyViews: 20000 },
  { name: "Waterfalls", wikipediaCategory: "Category:Waterfalls", entityType: "waterfall", minMonthlyViews: 15000 },
  { name: "National Parks", wikipediaCategory: "Category:National_parks", entityType: "national park", minMonthlyViews: 20000 },
  { name: "Seas and Oceans", wikipediaCategory: "Category:Seas", entityType: "sea or ocean" },
  { name: "Peninsulas", wikipediaCategory: "Category:Peninsulas", entityType: "peninsula", minMonthlyViews: 15000 },

  // === Animals ===
  { name: "Animals", wikipediaCategory: "Category:Animals", entityType: "animal species", minMonthlyViews: 35000 },
  { name: "Mammals", wikipediaCategory: "Category:Mammals", entityType: "mammal species", minMonthlyViews: 25000 },
  { name: "Birds", wikipediaCategory: "Category:Birds", entityType: "bird species", minMonthlyViews: 20000 },
  { name: "Reptiles", wikipediaCategory: "Category:Reptiles", entityType: "reptile species", minMonthlyViews: 20000 },
  { name: "Fish", wikipediaCategory: "Category:Fish", entityType: "fish species", minMonthlyViews: 20000 },
  { name: "Insects", wikipediaCategory: "Category:Insects", entityType: "insect species", minMonthlyViews: 20000 },
  { name: "Amphibians", wikipediaCategory: "Category:Amphibians", entityType: "amphibian species", minMonthlyViews: 15000 },
  { name: "Sharks", wikipediaCategory: "Category:Sharks", entityType: "shark species" },
  { name: "Dinosaurs", wikipediaCategory: "Category:Dinosaurs", entityType: "dinosaur species", minMonthlyViews: 15000 },
  { name: "Endangered Species", wikipediaCategory: "Category:Endangered_species", entityType: "endangered species", minMonthlyViews: 20000 },
  { name: "Marine Animals", wikipediaCategory: "Category:Marine_animals", entityType: "marine animal", minMonthlyViews: 20000 },
  { name: "Big Cats", wikipediaCategory: "Category:Panthera", entityType: "big cat" },
  { name: "Primates", wikipediaCategory: "Category:Primates", entityType: "primate species", minMonthlyViews: 15000 },
  { name: "Spiders", wikipediaCategory: "Category:Spiders", entityType: "spider species", minMonthlyViews: 15000 },
  { name: "Bears", wikipediaCategory: "Category:Bears", entityType: "bear species" },
  { name: "Snakes", wikipediaCategory: "Category:Snakes", entityType: "snake species", minMonthlyViews: 15000 },

  // === Architecture & Landmarks ===
  { name: "Famous Structures", wikipediaCategory: "Category:Buildings_and_structures", entityType: "famous structure", minMonthlyViews: 50000 },
  { name: "UNESCO World Heritage Sites", wikipediaCategory: "Category:World_Heritage_Sites", entityType: "UNESCO World Heritage Site", minMonthlyViews: 25000 },
  { name: "Bridges", wikipediaCategory: "Category:Bridges", entityType: "bridge", minMonthlyViews: 20000 },
  { name: "Skyscrapers", wikipediaCategory: "Category:Skyscrapers", entityType: "skyscraper", minMonthlyViews: 20000 },
  { name: "Castles", wikipediaCategory: "Category:Castles", entityType: "castle", minMonthlyViews: 15000 },
  { name: "Cathedrals", wikipediaCategory: "Category:Cathedrals", entityType: "cathedral", minMonthlyViews: 15000 },

  // === Space ===
  { name: "Planets", wikipediaCategory: "Category:Planets_of_the_Solar_System", entityType: "planet" },
  { name: "Moons", wikipediaCategory: "Category:Moons_of_the_Solar_System", entityType: "moon" },
  { name: "Space Missions", wikipediaCategory: "Category:Space_missions", entityType: "space mission", minMonthlyViews: 20000 },
  { name: "Galaxies", wikipediaCategory: "Category:Galaxies", entityType: "galaxy", minMonthlyViews: 15000 },

  // === Business & Tech ===
  { name: "Tech Companies", wikipediaCategory: "Category:Technology_companies_of_the_United_States", entityType: "tech company", minMonthlyViews: 40000 },
  { name: "Tech Entrepreneurs", wikipediaCategory: "Category:American_technology_company_founders", entityType: "tech entrepreneur", minMonthlyViews: 40000 },
  { name: "Video Games", wikipediaCategory: "Category:Video_games", entityType: "video game", minMonthlyViews: 40000 },
  { name: "Video Game Consoles", wikipediaCategory: "Category:Video_game_consoles", entityType: "video game console" },
  { name: "Automobile Manufacturers", wikipediaCategory: "Category:Automobile_manufacturers", entityType: "automobile manufacturer", minMonthlyViews: 30000 },
  { name: "Airlines", wikipediaCategory: "Category:Airlines", entityType: "airline", minMonthlyViews: 25000 },

  // === Philosophy & Religion ===
  { name: "Philosophers", wikipediaCategory: "Category:Philosophers", entityType: "philosopher", minMonthlyViews: 25000 },
  { name: "Religious Figures", wikipediaCategory: "Category:Religious_leaders", entityType: "religious leader", minMonthlyViews: 25000 },

  // === Sports Teams ===
  { name: "NFL Teams", wikipediaCategory: "Category:National_Football_League_teams", entityType: "NFL team" },
  { name: "NBA Teams", wikipediaCategory: "Category:National_Basketball_Association_teams", entityType: "NBA team" },
  { name: "MLB Teams", wikipediaCategory: "Category:Major_League_Baseball_teams", entityType: "MLB team" },
  { name: "NHL Teams", wikipediaCategory: "Category:National_Hockey_League_teams", entityType: "NHL team" },
  { name: "Soccer Clubs", wikipediaCategory: "Category:Association_football_clubs", entityType: "soccer club", minMonthlyViews: 40000 },

  // === Entertainment & Pop Culture ===
  { name: "Supermodels", wikipediaCategory: "Category:Supermodels", entityType: "supermodel", minMonthlyViews: 25000 },
  { name: "Celebrity Chefs", wikipediaCategory: "Category:Celebrity_chefs", entityType: "celebrity chef", minMonthlyViews: 25000 },
  { name: "Broadway Musicals", wikipediaCategory: "Category:Broadway_musicals", entityType: "Broadway musical", minMonthlyViews: 25000 },

  // === Fashion & Lifestyle ===
  { name: "Fashion Designers", wikipediaCategory: "Category:Fashion_designers", entityType: "fashion designer", minMonthlyViews: 25000 },
  { name: "Luxury Fashion Houses", wikipediaCategory: "Category:Luxury_brands", entityType: "luxury fashion house", minMonthlyViews: 30000 },

  // === Food & Drink ===
  { name: "Fast Food Chains", wikipediaCategory: "Category:Fast_food_restaurants", entityType: "fast food chain", minMonthlyViews: 30000 },
  { name: "Cheeses", wikipediaCategory: "Category:Cheeses", entityType: "variety of cheese", minMonthlyViews: 15000 },
  { name: "Cocktails", wikipediaCategory: "Category:Cocktails", entityType: "cocktail", minMonthlyViews: 15000 },

  // === Military Hardware ===
  { name: "Military Aircraft", wikipediaCategory: "Category:Military_aircraft", entityType: "military aircraft", minMonthlyViews: 20000 },
  { name: "Battleships", wikipediaCategory: "Category:Battleships", entityType: "battleship", minMonthlyViews: 15000 },

  // === Mythology ===
  { name: "Greek Mythology", wikipediaCategory: "Category:Greek_mythology", entityType: "figure from Greek mythology", minMonthlyViews: 20000 },
  { name: "Norse Mythology", wikipediaCategory: "Category:Norse_mythology", entityType: "figure from Norse mythology", minMonthlyViews: 15000 },
  { name: "Roman Mythology", wikipediaCategory: "Category:Roman_mythology", entityType: "figure from Roman mythology", minMonthlyViews: 15000 },
];
