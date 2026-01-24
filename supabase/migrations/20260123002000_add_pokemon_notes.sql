-- Add notes for existing pokemon entries.

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Meowth at level 28.'
WHERE "pokedexNumber" = 53
  AND pokemon = 'Persian'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Greavard at level 30 at night.'
WHERE "pokedexNumber" = 972
  AND pokemon = 'Houndstone'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Chingling with high friendship at night.'
WHERE "pokedexNumber" = 358
  AND pokemon = 'Chimecho'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Munna with a Moon Stone.'
WHERE "pokedexNumber" = 518
  AND pokemon = 'Musharna'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wimpod at level 30.'
WHERE "pokedexNumber" = 768
  AND pokemon = 'Golisopod'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nickit at level 18.'
WHERE "pokedexNumber" = 828
  AND pokemon = 'Thievul'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Clobbopus when leveled up knowing Taunt (typically learns at level 35).'
WHERE "pokedexNumber" = 853
  AND pokemon = 'Grapploct'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Spoink at level 32.'
WHERE "pokedexNumber" = 326
  AND pokemon = 'Grumpig'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Crabrawler with an Ice Stone.'
WHERE "pokedexNumber" = 740
  AND pokemon = 'Crabominable'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gulpin at level 26.'
WHERE "pokedexNumber" = 317
  AND pokemon = 'Swalot'
  AND form IN ('male', 'Female');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Toxel at level 30 with certain Natures (e.g., Adamant, Jolly, Naughty). Base Nature determines form; Mints do not affect evolution.'
WHERE "pokedexNumber" = 849
  AND pokemon = 'Toxtricity'
  AND form = 'Amped';

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Toxel at level 30 with certain Natures (e.g., Modest, Timid, Calm, Gentle). Base Nature determines form; Mints do not affect evolution.'
WHERE "pokedexNumber" = 849
  AND pokemon = 'Toxtricity'
  AND form = 'Low-key';

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mudkip at level 16.'
WHERE "pokedexNumber" = 259
  AND pokemon = 'Marshtomp'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Marshtomp at level 36.'
WHERE "pokedexNumber" = 260
  AND pokemon = 'Swampert'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Capsakid with a Fire Stone.'
WHERE "pokedexNumber" = 952
  AND pokemon = 'Scovillain'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Galarian Yamask after taking 49+ damage without fainting, then standing under the bridge between Wild Zone 11 and 17 in Lumiose City and choosing evolve (Pokémon Legends: Z-A).'
WHERE "pokedexNumber" = 867
  AND pokemon = 'Runerigus'
  AND form IS NULL;

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Yamask (Unovan) at level 34.'
WHERE "pokedexNumber" = 563
  AND pokemon = 'Cofagrigus'
  AND form IS NULL;
