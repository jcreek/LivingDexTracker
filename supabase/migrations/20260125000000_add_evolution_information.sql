UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bulbasaur at level 16.'
WHERE "pokedexNumber" = 2
  AND pokemon = 'Ivysaur'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Ivysaur at level 32.'
WHERE "pokedexNumber" = 3
  AND pokemon = 'Venusaur'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Charmander at level 16.'
WHERE "pokedexNumber" = 5
  AND pokemon = 'Charmeleon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Charmeleon at level 36.'
WHERE "pokedexNumber" = 6
  AND pokemon = 'Charizard'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Squirtle at level 16.'
WHERE "pokedexNumber" = 8
  AND pokemon = 'Wartortle'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wartortle at level 36.'
WHERE "pokedexNumber" = 9
  AND pokemon = 'Blastoise'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Caterpie at level 7.'
WHERE "pokedexNumber" = 11
  AND pokemon = 'Metapod'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Metapod at level 10.'
WHERE "pokedexNumber" = 12
  AND pokemon = 'Butterfree'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Weedle at level 7.'
WHERE "pokedexNumber" = 14
  AND pokemon = 'Kakuna'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Kakuna at level 10.'
WHERE "pokedexNumber" = 15
  AND pokemon = 'Beedrill'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pidgey at level 18.'
WHERE "pokedexNumber" = 17
  AND pokemon = 'Pidgeotto'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pidgeotto at level 36.'
WHERE "pokedexNumber" = 18
  AND pokemon = 'Pidgeot'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rattata at level 20 or at level 20 at night.'
WHERE "pokedexNumber" = 20
  AND pokemon = 'Raticate'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Spearow at level 20.'
WHERE "pokedexNumber" = 22
  AND pokemon = 'Fearow'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Ekans at level 22.'
WHERE "pokedexNumber" = 24
  AND pokemon = 'Arbok'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pichu when leveled up and with high friendship.'
WHERE "pokedexNumber" = 25
  AND pokemon = 'Pikachu'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pikachu using Thunder Stone.'
WHERE "pokedexNumber" = 26
  AND pokemon = 'Raichu'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sandshrew at level 22 or using Ice Stone.'
WHERE "pokedexNumber" = 28
  AND pokemon = 'Sandslash'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nidoran F at level 16.'
WHERE "pokedexNumber" = 30
  AND pokemon = 'Nidorina'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nidorina using Moon Stone.'
WHERE "pokedexNumber" = 31
  AND pokemon = 'Nidoqueen'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nidoran M at level 16.'
WHERE "pokedexNumber" = 33
  AND pokemon = 'Nidorino'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nidorino using Moon Stone.'
WHERE "pokedexNumber" = 34
  AND pokemon = 'Nidoking'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cleffa when leveled up and with high friendship.'
WHERE "pokedexNumber" = 35
  AND pokemon = 'Clefairy'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Clefairy using Moon Stone.'
WHERE "pokedexNumber" = 36
  AND pokemon = 'Clefable'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Vulpix using Fire Stone or using Ice Stone.'
WHERE "pokedexNumber" = 38
  AND pokemon = 'Ninetales'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Igglybuff when leveled up and with high friendship.'
WHERE "pokedexNumber" = 39
  AND pokemon = 'Jigglypuff'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Jigglypuff using Moon Stone.'
WHERE "pokedexNumber" = 40
  AND pokemon = 'Wigglytuff'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Zubat at level 22.'
WHERE "pokedexNumber" = 42
  AND pokemon = 'Golbat'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Oddish at level 21.'
WHERE "pokedexNumber" = 44
  AND pokemon = 'Gloom'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gloom using Leaf Stone.'
WHERE "pokedexNumber" = 45
  AND pokemon = 'Vileplume'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Paras at level 24.'
WHERE "pokedexNumber" = 47
  AND pokemon = 'Parasect'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Venonat at level 31.'
WHERE "pokedexNumber" = 49
  AND pokemon = 'Venomoth'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Diglett at level 26.'
WHERE "pokedexNumber" = 51
  AND pokemon = 'Dugtrio'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Meowth at level 28 or when leveled up and with high friendship.'
WHERE "pokedexNumber" = 53
  AND pokemon = 'Persian'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Psyduck at level 33.'
WHERE "pokedexNumber" = 55
  AND pokemon = 'Golduck'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mankey at level 28.'
WHERE "pokedexNumber" = 57
  AND pokemon = 'Primeape'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Growlithe using Fire Stone.'
WHERE "pokedexNumber" = 59
  AND pokemon = 'Arcanine'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Poliwag at level 25.'
WHERE "pokedexNumber" = 61
  AND pokemon = 'Poliwhirl'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Poliwhirl using Water Stone.'
WHERE "pokedexNumber" = 62
  AND pokemon = 'Poliwrath'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Abra at level 16.'
WHERE "pokedexNumber" = 64
  AND pokemon = 'Kadabra'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Kadabra via trade.'
WHERE "pokedexNumber" = 65
  AND pokemon = 'Alakazam'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Machop at level 28.'
WHERE "pokedexNumber" = 67
  AND pokemon = 'Machoke'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Machoke via trade.'
WHERE "pokedexNumber" = 68
  AND pokemon = 'Machamp'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bellsprout at level 21.'
WHERE "pokedexNumber" = 70
  AND pokemon = 'Weepinbell'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Weepinbell using Leaf Stone.'
WHERE "pokedexNumber" = 71
  AND pokemon = 'Victreebel'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tentacool at level 30.'
WHERE "pokedexNumber" = 73
  AND pokemon = 'Tentacruel'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Geodude at level 25.'
WHERE "pokedexNumber" = 75
  AND pokemon = 'Graveler'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Graveler via trade.'
WHERE "pokedexNumber" = 76
  AND pokemon = 'Golem'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Ponyta at level 40.'
WHERE "pokedexNumber" = 78
  AND pokemon = 'Rapidash'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Slowpoke at level 37 or using Galarica Cuff.'
WHERE "pokedexNumber" = 80
  AND pokemon = 'Slowbro'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Magnemite at level 30.'
WHERE "pokedexNumber" = 82
  AND pokemon = 'Magneton'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Doduo at level 31.'
WHERE "pokedexNumber" = 85
  AND pokemon = 'Dodrio'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Seel at level 34.'
WHERE "pokedexNumber" = 87
  AND pokemon = 'Dewgong'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Grimer at level 38.'
WHERE "pokedexNumber" = 89
  AND pokemon = 'Muk'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Shellder using Water Stone.'
WHERE "pokedexNumber" = 91
  AND pokemon = 'Cloyster'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gastly at level 25.'
WHERE "pokedexNumber" = 93
  AND pokemon = 'Haunter'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Haunter via trade.'
WHERE "pokedexNumber" = 94
  AND pokemon = 'Gengar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Drowzee at level 26.'
WHERE "pokedexNumber" = 97
  AND pokemon = 'Hypno'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Krabby at level 28.'
WHERE "pokedexNumber" = 99
  AND pokemon = 'Kingler'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Voltorb at level 30.'
WHERE "pokedexNumber" = 101
  AND pokemon = 'Electrode'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Exeggcute using Leaf Stone.'
WHERE "pokedexNumber" = 103
  AND pokemon = 'Exeggutor'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cubone at level 28 or at level 28 at night.'
WHERE "pokedexNumber" = 105
  AND pokemon = 'Marowak'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tyrogue at level 20 and with higher Attack than Defense.'
WHERE "pokedexNumber" = 106
  AND pokemon = 'Hitmonlee'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tyrogue at level 20 and with lower Attack than Defense.'
WHERE "pokedexNumber" = 107
  AND pokemon = 'Hitmonchan'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Koffing at level 35.'
WHERE "pokedexNumber" = 110
  AND pokemon = 'Weezing'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rhyhorn at level 42.'
WHERE "pokedexNumber" = 112
  AND pokemon = 'Rhydon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Happiny when leveled up and during the day and holding Oval Stone.'
WHERE "pokedexNumber" = 113
  AND pokemon = 'Chansey'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Horsea at level 32.'
WHERE "pokedexNumber" = 117
  AND pokemon = 'Seadra'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Goldeen at level 33.'
WHERE "pokedexNumber" = 119
  AND pokemon = 'Seaking'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Staryu using Water Stone.'
WHERE "pokedexNumber" = 121
  AND pokemon = 'Starmie'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mime Jr. when leveled up and knowing Mimic.'
WHERE "pokedexNumber" = 122
  AND pokemon = 'Mr. Mime'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Smoochum at level 30.'
WHERE "pokedexNumber" = 124
  AND pokemon = 'Jynx'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Elekid at level 30.'
WHERE "pokedexNumber" = 125
  AND pokemon = 'Electabuzz'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Magby at level 30.'
WHERE "pokedexNumber" = 126
  AND pokemon = 'Magmar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Magikarp at level 20.'
WHERE "pokedexNumber" = 130
  AND pokemon = 'Gyarados'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Eevee using Water Stone.'
WHERE "pokedexNumber" = 134
  AND pokemon = 'Vaporeon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Eevee using Thunder Stone.'
WHERE "pokedexNumber" = 135
  AND pokemon = 'Jolteon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Eevee using Fire Stone.'
WHERE "pokedexNumber" = 136
  AND pokemon = 'Flareon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Omanyte at level 40.'
WHERE "pokedexNumber" = 139
  AND pokemon = 'Omastar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Kabuto at level 40.'
WHERE "pokedexNumber" = 141
  AND pokemon = 'Kabutops'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Munchlax when leveled up and with high friendship.'
WHERE "pokedexNumber" = 143
  AND pokemon = 'Snorlax'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dratini at level 30.'
WHERE "pokedexNumber" = 148
  AND pokemon = 'Dragonair'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dragonair at level 55.'
WHERE "pokedexNumber" = 149
  AND pokemon = 'Dragonite'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Chikorita at level 16.'
WHERE "pokedexNumber" = 153
  AND pokemon = 'Bayleef'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bayleef at level 32.'
WHERE "pokedexNumber" = 154
  AND pokemon = 'Meganium'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cyndaquil at level 14.'
WHERE "pokedexNumber" = 156
  AND pokemon = 'Quilava'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Quilava at level 36.'
WHERE "pokedexNumber" = 157
  AND pokemon = 'Typhlosion'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Totodile at level 18.'
WHERE "pokedexNumber" = 159
  AND pokemon = 'Croconaw'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Croconaw at level 30.'
WHERE "pokedexNumber" = 160
  AND pokemon = 'Feraligatr'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sentret at level 15.'
WHERE "pokedexNumber" = 162
  AND pokemon = 'Furret'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Hoothoot at level 20.'
WHERE "pokedexNumber" = 164
  AND pokemon = 'Noctowl'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Ledyba at level 18.'
WHERE "pokedexNumber" = 166
  AND pokemon = 'Ledian'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Spinarak at level 22.'
WHERE "pokedexNumber" = 168
  AND pokemon = 'Ariados'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Golbat when leveled up and with high friendship.'
WHERE "pokedexNumber" = 169
  AND pokemon = 'Crobat'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Chinchou at level 27.'
WHERE "pokedexNumber" = 171
  AND pokemon = 'Lanturn'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Togepi when leveled up and with high friendship.'
WHERE "pokedexNumber" = 176
  AND pokemon = 'Togetic'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Natu at level 25.'
WHERE "pokedexNumber" = 178
  AND pokemon = 'Xatu'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mareep at level 15.'
WHERE "pokedexNumber" = 180
  AND pokemon = 'Flaaffy'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Flaaffy at level 30.'
WHERE "pokedexNumber" = 181
  AND pokemon = 'Ampharos'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gloom using Sun Stone.'
WHERE "pokedexNumber" = 182
  AND pokemon = 'Bellossom'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Azurill when leveled up and with high friendship.'
WHERE "pokedexNumber" = 183
  AND pokemon = 'Marill'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Marill at level 18.'
WHERE "pokedexNumber" = 184
  AND pokemon = 'Azumarill'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bonsly when leveled up and knowing Mimic.'
WHERE "pokedexNumber" = 185
  AND pokemon = 'Sudowoodo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Poliwhirl via trade and holding Kings Rock.'
WHERE "pokedexNumber" = 186
  AND pokemon = 'Politoed'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Hoppip at level 18.'
WHERE "pokedexNumber" = 188
  AND pokemon = 'Skiploom'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Skiploom at level 27.'
WHERE "pokedexNumber" = 189
  AND pokemon = 'Jumpluff'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sunkern using Sun Stone.'
WHERE "pokedexNumber" = 192
  AND pokemon = 'Sunflora'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wooper at level 20.'
WHERE "pokedexNumber" = 195
  AND pokemon = 'Quagsire'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Eevee when leveled up and during the day and with high friendship.'
WHERE "pokedexNumber" = 196
  AND pokemon = 'Espeon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Eevee when leveled up and at night and with high friendship.'
WHERE "pokedexNumber" = 197
  AND pokemon = 'Umbreon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Slowpoke via trade and holding Kings Rock or using Galarica Wreath.'
WHERE "pokedexNumber" = 199
  AND pokemon = 'Slowking'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wynaut at level 15.'
WHERE "pokedexNumber" = 202
  AND pokemon = 'Wobbuffet'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pineco at level 31.'
WHERE "pokedexNumber" = 205
  AND pokemon = 'Forretress'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Onix via trade and holding Metal Coat.'
WHERE "pokedexNumber" = 208
  AND pokemon = 'Steelix'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Snubbull at level 23.'
WHERE "pokedexNumber" = 210
  AND pokemon = 'Granbull'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Scyther via trade and holding Metal Coat.'
WHERE "pokedexNumber" = 212
  AND pokemon = 'Scizor'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Teddiursa at level 30.'
WHERE "pokedexNumber" = 217
  AND pokemon = 'Ursaring'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Slugma at level 38.'
WHERE "pokedexNumber" = 219
  AND pokemon = 'Magcargo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Swinub at level 33.'
WHERE "pokedexNumber" = 221
  AND pokemon = 'Piloswine'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Remoraid at level 25.'
WHERE "pokedexNumber" = 224
  AND pokemon = 'Octillery'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mantyke when leveled up and with Remoraid in party.'
WHERE "pokedexNumber" = 226
  AND pokemon = 'Mantine'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Houndour at level 24.'
WHERE "pokedexNumber" = 229
  AND pokemon = 'Houndoom'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Seadra via trade and holding Dragon Scale.'
WHERE "pokedexNumber" = 230
  AND pokemon = 'Kingdra'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Phanpy at level 25.'
WHERE "pokedexNumber" = 232
  AND pokemon = 'Donphan'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Porygon via trade and holding Up Grade.'
WHERE "pokedexNumber" = 233
  AND pokemon = 'Porygon2'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tyrogue at level 20 and with Attack equal to Defense.'
WHERE "pokedexNumber" = 237
  AND pokemon = 'Hitmontop'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Chansey when leveled up and with high friendship.'
WHERE "pokedexNumber" = 242
  AND pokemon = 'Blissey'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Larvitar at level 30.'
WHERE "pokedexNumber" = 247
  AND pokemon = 'Pupitar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pupitar at level 55.'
WHERE "pokedexNumber" = 248
  AND pokemon = 'Tyranitar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Treecko at level 16.'
WHERE "pokedexNumber" = 253
  AND pokemon = 'Grovyle'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Grovyle at level 36.'
WHERE "pokedexNumber" = 254
  AND pokemon = 'Sceptile'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Torchic at level 16.'
WHERE "pokedexNumber" = 256
  AND pokemon = 'Combusken'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Combusken at level 36.'
WHERE "pokedexNumber" = 257
  AND pokemon = 'Blaziken'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mudkip at level 16.'
WHERE "pokedexNumber" = 259
  AND pokemon = 'Marshtomp'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Marshtomp at level 36.'
WHERE "pokedexNumber" = 260
  AND pokemon = 'Swampert'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Poochyena at level 18.'
WHERE "pokedexNumber" = 262
  AND pokemon = 'Mightyena'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Zigzagoon at level 20.'
WHERE "pokedexNumber" = 264
  AND pokemon = 'Linoone'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wurmple at level 7.'
WHERE "pokedexNumber" = 266
  AND pokemon = 'Silcoon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Silcoon at level 10.'
WHERE "pokedexNumber" = 267
  AND pokemon = 'Beautifly'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wurmple at level 7.'
WHERE "pokedexNumber" = 268
  AND pokemon = 'Cascoon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cascoon at level 10.'
WHERE "pokedexNumber" = 269
  AND pokemon = 'Dustox'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Lotad at level 14.'
WHERE "pokedexNumber" = 271
  AND pokemon = 'Lombre'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Lombre using Water Stone.'
WHERE "pokedexNumber" = 272
  AND pokemon = 'Ludicolo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Seedot at level 14.'
WHERE "pokedexNumber" = 274
  AND pokemon = 'Nuzleaf'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nuzleaf using Leaf Stone.'
WHERE "pokedexNumber" = 275
  AND pokemon = 'Shiftry'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Taillow at level 22.'
WHERE "pokedexNumber" = 277
  AND pokemon = 'Swellow'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wingull at level 25.'
WHERE "pokedexNumber" = 279
  AND pokemon = 'Pelipper'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Ralts at level 20.'
WHERE "pokedexNumber" = 281
  AND pokemon = 'Kirlia'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Kirlia at level 30.'
WHERE "pokedexNumber" = 282
  AND pokemon = 'Gardevoir'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Surskit at level 22.'
WHERE "pokedexNumber" = 284
  AND pokemon = 'Masquerain'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Shroomish at level 23.'
WHERE "pokedexNumber" = 286
  AND pokemon = 'Breloom'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Slakoth at level 18.'
WHERE "pokedexNumber" = 288
  AND pokemon = 'Vigoroth'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Vigoroth at level 36.'
WHERE "pokedexNumber" = 289
  AND pokemon = 'Slaking'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nincada at level 20.'
WHERE "pokedexNumber" = 291
  AND pokemon = 'Ninjask'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nincada when it sheds.'
WHERE "pokedexNumber" = 292
  AND pokemon = 'Shedinja'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Whismur at level 20.'
WHERE "pokedexNumber" = 294
  AND pokemon = 'Loudred'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Loudred at level 40.'
WHERE "pokedexNumber" = 295
  AND pokemon = 'Exploud'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Makuhita at level 24.'
WHERE "pokedexNumber" = 297
  AND pokemon = 'Hariyama'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Skitty using Moon Stone.'
WHERE "pokedexNumber" = 301
  AND pokemon = 'Delcatty'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Aron at level 32.'
WHERE "pokedexNumber" = 305
  AND pokemon = 'Lairon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Lairon at level 42.'
WHERE "pokedexNumber" = 306
  AND pokemon = 'Aggron'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Meditite at level 37.'
WHERE "pokedexNumber" = 308
  AND pokemon = 'Medicham'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Electrike at level 26.'
WHERE "pokedexNumber" = 310
  AND pokemon = 'Manectric'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Budew when leveled up and during the day and with high friendship.'
WHERE "pokedexNumber" = 315
  AND pokemon = 'Roselia'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gulpin at level 26.'
WHERE "pokedexNumber" = 317
  AND pokemon = 'Swalot'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Carvanha at level 30.'
WHERE "pokedexNumber" = 319
  AND pokemon = 'Sharpedo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wailmer at level 40.'
WHERE "pokedexNumber" = 321
  AND pokemon = 'Wailord'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Numel at level 33.'
WHERE "pokedexNumber" = 323
  AND pokemon = 'Camerupt'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Spoink at level 32.'
WHERE "pokedexNumber" = 326
  AND pokemon = 'Grumpig'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Trapinch at level 35.'
WHERE "pokedexNumber" = 329
  AND pokemon = 'Vibrava'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Vibrava at level 45.'
WHERE "pokedexNumber" = 330
  AND pokemon = 'Flygon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cacnea at level 32.'
WHERE "pokedexNumber" = 332
  AND pokemon = 'Cacturne'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Swablu at level 35.'
WHERE "pokedexNumber" = 334
  AND pokemon = 'Altaria'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Barboach at level 30.'
WHERE "pokedexNumber" = 340
  AND pokemon = 'Whiscash'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Corphish at level 30.'
WHERE "pokedexNumber" = 342
  AND pokemon = 'Crawdaunt'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Baltoy at level 36.'
WHERE "pokedexNumber" = 344
  AND pokemon = 'Claydol'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Lileep at level 40.'
WHERE "pokedexNumber" = 346
  AND pokemon = 'Cradily'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Anorith at level 40.'
WHERE "pokedexNumber" = 348
  AND pokemon = 'Armaldo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Feebas when leveled up and with high beauty or via trade and holding Prism Scale.'
WHERE "pokedexNumber" = 350
  AND pokemon = 'Milotic'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Shuppet at level 37.'
WHERE "pokedexNumber" = 354
  AND pokemon = 'Banette'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Duskull at level 37.'
WHERE "pokedexNumber" = 356
  AND pokemon = 'Dusclops'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Chingling when leveled up and at night and with high friendship.'
WHERE "pokedexNumber" = 358
  AND pokemon = 'Chimecho'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Snorunt at level 42.'
WHERE "pokedexNumber" = 362
  AND pokemon = 'Glalie'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Spheal at level 32.'
WHERE "pokedexNumber" = 364
  AND pokemon = 'Sealeo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sealeo at level 44.'
WHERE "pokedexNumber" = 365
  AND pokemon = 'Walrein'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Clamperl via trade and holding Deep Sea Tooth.'
WHERE "pokedexNumber" = 367
  AND pokemon = 'Huntail'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Clamperl via trade and holding Deep Sea Scale.'
WHERE "pokedexNumber" = 368
  AND pokemon = 'Gorebyss'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bagon at level 30.'
WHERE "pokedexNumber" = 372
  AND pokemon = 'Shelgon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Shelgon at level 50.'
WHERE "pokedexNumber" = 373
  AND pokemon = 'Salamence'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Beldum at level 20.'
WHERE "pokedexNumber" = 375
  AND pokemon = 'Metang'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Metang at level 45.'
WHERE "pokedexNumber" = 376
  AND pokemon = 'Metagross'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Turtwig at level 18.'
WHERE "pokedexNumber" = 388
  AND pokemon = 'Grotle'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Grotle at level 32.'
WHERE "pokedexNumber" = 389
  AND pokemon = 'Torterra'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Chimchar at level 14.'
WHERE "pokedexNumber" = 391
  AND pokemon = 'Monferno'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Monferno at level 36.'
WHERE "pokedexNumber" = 392
  AND pokemon = 'Infernape'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Piplup at level 16.'
WHERE "pokedexNumber" = 394
  AND pokemon = 'Prinplup'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Prinplup at level 36.'
WHERE "pokedexNumber" = 395
  AND pokemon = 'Empoleon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Starly at level 14.'
WHERE "pokedexNumber" = 397
  AND pokemon = 'Staravia'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Staravia at level 34.'
WHERE "pokedexNumber" = 398
  AND pokemon = 'Staraptor'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bidoof at level 15.'
WHERE "pokedexNumber" = 400
  AND pokemon = 'Bibarel'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Kricketot at level 10.'
WHERE "pokedexNumber" = 402
  AND pokemon = 'Kricketune'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Shinx at level 15.'
WHERE "pokedexNumber" = 404
  AND pokemon = 'Luxio'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Luxio at level 30.'
WHERE "pokedexNumber" = 405
  AND pokemon = 'Luxray'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Roselia using Shiny Stone.'
WHERE "pokedexNumber" = 407
  AND pokemon = 'Roserade'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cranidos at level 30.'
WHERE "pokedexNumber" = 409
  AND pokemon = 'Rampardos'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Shieldon at level 30.'
WHERE "pokedexNumber" = 411
  AND pokemon = 'Bastiodon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Burmy at level 20 and if female.'
WHERE "pokedexNumber" = 413
  AND pokemon = 'Wormadam'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Burmy at level 20 and if male.'
WHERE "pokedexNumber" = 414
  AND pokemon = 'Mothim'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Combee at level 21 and if female.'
WHERE "pokedexNumber" = 416
  AND pokemon = 'Vespiquen'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Buizel at level 26.'
WHERE "pokedexNumber" = 419
  AND pokemon = 'Floatzel'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cherubi at level 25.'
WHERE "pokedexNumber" = 421
  AND pokemon = 'Cherrim'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Shellos at level 30.'
WHERE "pokedexNumber" = 423
  AND pokemon = 'Gastrodon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Aipom when leveled up and knowing Double Hit.'
WHERE "pokedexNumber" = 424
  AND pokemon = 'Ambipom'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Drifloon at level 28.'
WHERE "pokedexNumber" = 426
  AND pokemon = 'Drifblim'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Buneary when leveled up and with high friendship.'
WHERE "pokedexNumber" = 428
  AND pokemon = 'Lopunny'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Misdreavus using Dusk Stone.'
WHERE "pokedexNumber" = 429
  AND pokemon = 'Mismagius'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Murkrow using Dusk Stone.'
WHERE "pokedexNumber" = 430
  AND pokemon = 'Honchkrow'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Glameow at level 38.'
WHERE "pokedexNumber" = 432
  AND pokemon = 'Purugly'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Stunky at level 34.'
WHERE "pokedexNumber" = 435
  AND pokemon = 'Skuntank'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bronzor at level 33.'
WHERE "pokedexNumber" = 437
  AND pokemon = 'Bronzong'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gible at level 24.'
WHERE "pokedexNumber" = 444
  AND pokemon = 'Gabite'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gabite at level 48.'
WHERE "pokedexNumber" = 445
  AND pokemon = 'Garchomp'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Riolu when leveled up and during the day and with high friendship.'
WHERE "pokedexNumber" = 448
  AND pokemon = 'Lucario'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Hippopotas at level 34.'
WHERE "pokedexNumber" = 450
  AND pokemon = 'Hippowdon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Skorupi at level 40.'
WHERE "pokedexNumber" = 452
  AND pokemon = 'Drapion'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Croagunk at level 37.'
WHERE "pokedexNumber" = 454
  AND pokemon = 'Toxicroak'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Finneon at level 31.'
WHERE "pokedexNumber" = 457
  AND pokemon = 'Lumineon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Snover at level 40.'
WHERE "pokedexNumber" = 460
  AND pokemon = 'Abomasnow'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sneasel when leveled up and at night and holding Razor Claw.'
WHERE "pokedexNumber" = 461
  AND pokemon = 'Weavile'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Magneton when leveled up and at Mt Coronet or when leveled up and at Chargestone Cave or when leveled up and at Kalos Route 13 or when leveled up and at Blush Mountain or when leveled up and at Vast Poni Canyon or using Thunder Stone.'
WHERE "pokedexNumber" = 462
  AND pokemon = 'Magnezone'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Lickitung when leveled up and knowing Rollout.'
WHERE "pokedexNumber" = 463
  AND pokemon = 'Lickilicky'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rhydon via trade and holding Protector.'
WHERE "pokedexNumber" = 464
  AND pokemon = 'Rhyperior'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tangela when leveled up and knowing Ancient Power.'
WHERE "pokedexNumber" = 465
  AND pokemon = 'Tangrowth'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Electabuzz via trade and holding Electirizer.'
WHERE "pokedexNumber" = 466
  AND pokemon = 'Electivire'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Magmar via trade and holding Magmarizer.'
WHERE "pokedexNumber" = 467
  AND pokemon = 'Magmortar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Togetic using Shiny Stone.'
WHERE "pokedexNumber" = 468
  AND pokemon = 'Togekiss'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Yanma when leveled up and knowing Ancient Power.'
WHERE "pokedexNumber" = 469
  AND pokemon = 'Yanmega'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Eevee when leveled up and at Eterna Forest or when leveled up and at Pinwheel Forest or when leveled up and at Kalos Route 20 or using Leaf Stone.'
WHERE "pokedexNumber" = 470
  AND pokemon = 'Leafeon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Eevee when leveled up and at Sinnoh Route 217 or when leveled up and at Twist Mountain or when leveled up and at Frost Cavern or using Ice Stone.'
WHERE "pokedexNumber" = 471
  AND pokemon = 'Glaceon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gligar when leveled up and at night and holding Razor Fang.'
WHERE "pokedexNumber" = 472
  AND pokemon = 'Gliscor'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Piloswine when leveled up and knowing Ancient Power.'
WHERE "pokedexNumber" = 473
  AND pokemon = 'Mamoswine'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Porygon2 via trade and holding Dubious Disc.'
WHERE "pokedexNumber" = 474
  AND pokemon = 'Porygon-Z'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Kirlia using Dawn Stone and if male.'
WHERE "pokedexNumber" = 475
  AND pokemon = 'Gallade'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nosepass when leveled up and at Mt Coronet or when leveled up and at Chargestone Cave or when leveled up and at Kalos Route 13 or when leveled up and at Blush Mountain or when leveled up and at Vast Poni Canyon or using Thunder Stone.'
WHERE "pokedexNumber" = 476
  AND pokemon = 'Probopass'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dusclops via trade and holding Reaper Cloth.'
WHERE "pokedexNumber" = 477
  AND pokemon = 'Dusknoir'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Snorunt using Dawn Stone and if female.'
WHERE "pokedexNumber" = 478
  AND pokemon = 'Froslass'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Snivy at level 17.'
WHERE "pokedexNumber" = 496
  AND pokemon = 'Servine'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Servine at level 36.'
WHERE "pokedexNumber" = 497
  AND pokemon = 'Serperior'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tepig at level 17.'
WHERE "pokedexNumber" = 499
  AND pokemon = 'Pignite'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pignite at level 36.'
WHERE "pokedexNumber" = 500
  AND pokemon = 'Emboar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Oshawott at level 17.'
WHERE "pokedexNumber" = 502
  AND pokemon = 'Dewott'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dewott at level 36.'
WHERE "pokedexNumber" = 503
  AND pokemon = 'Samurott'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Patrat at level 20.'
WHERE "pokedexNumber" = 505
  AND pokemon = 'Watchog'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Lillipup at level 16.'
WHERE "pokedexNumber" = 507
  AND pokemon = 'Herdier'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Herdier at level 32.'
WHERE "pokedexNumber" = 508
  AND pokemon = 'Stoutland'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Purrloin at level 20.'
WHERE "pokedexNumber" = 510
  AND pokemon = 'Liepard'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pansage using Leaf Stone.'
WHERE "pokedexNumber" = 512
  AND pokemon = 'Simisage'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pansear using Fire Stone.'
WHERE "pokedexNumber" = 514
  AND pokemon = 'Simisear'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Panpour using Water Stone.'
WHERE "pokedexNumber" = 516
  AND pokemon = 'Simipour'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Munna using Moon Stone.'
WHERE "pokedexNumber" = 518
  AND pokemon = 'Musharna'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pidove at level 21.'
WHERE "pokedexNumber" = 520
  AND pokemon = 'Tranquill'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tranquill at level 32.'
WHERE "pokedexNumber" = 521
  AND pokemon = 'Unfezant'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Blitzle at level 27.'
WHERE "pokedexNumber" = 523
  AND pokemon = 'Zebstrika'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Roggenrola at level 25.'
WHERE "pokedexNumber" = 525
  AND pokemon = 'Boldore'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Boldore via trade.'
WHERE "pokedexNumber" = 526
  AND pokemon = 'Gigalith'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Woobat when leveled up and with high friendship.'
WHERE "pokedexNumber" = 528
  AND pokemon = 'Swoobat'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Drilbur at level 31.'
WHERE "pokedexNumber" = 530
  AND pokemon = 'Excadrill'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Timburr at level 25.'
WHERE "pokedexNumber" = 533
  AND pokemon = 'Gurdurr'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gurdurr via trade.'
WHERE "pokedexNumber" = 534
  AND pokemon = 'Conkeldurr'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tympole at level 25.'
WHERE "pokedexNumber" = 536
  AND pokemon = 'Palpitoad'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Palpitoad at level 36.'
WHERE "pokedexNumber" = 537
  AND pokemon = 'Seismitoad'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sewaddle at level 20.'
WHERE "pokedexNumber" = 541
  AND pokemon = 'Swadloon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Swadloon when leveled up and with high friendship.'
WHERE "pokedexNumber" = 542
  AND pokemon = 'Leavanny'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Venipede at level 22.'
WHERE "pokedexNumber" = 544
  AND pokemon = 'Whirlipede'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Whirlipede at level 30.'
WHERE "pokedexNumber" = 545
  AND pokemon = 'Scolipede'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cottonee using Sun Stone.'
WHERE "pokedexNumber" = 547
  AND pokemon = 'Whimsicott'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Petilil using Sun Stone.'
WHERE "pokedexNumber" = 549
  AND pokemon = 'Lilligant'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sandile at level 29.'
WHERE "pokedexNumber" = 552
  AND pokemon = 'Krokorok'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Krokorok at level 40.'
WHERE "pokedexNumber" = 553
  AND pokemon = 'Krookodile'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Darumaka at level 35 or using Ice Stone.'
WHERE "pokedexNumber" = 555
  AND pokemon = 'Darmanitan'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dwebble at level 34.'
WHERE "pokedexNumber" = 558
  AND pokemon = 'Crustle'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Scraggy at level 39.'
WHERE "pokedexNumber" = 560
  AND pokemon = 'Scrafty'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Yamask at level 34.'
WHERE "pokedexNumber" = 563
  AND pokemon = 'Cofagrigus'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tirtouga at level 37.'
WHERE "pokedexNumber" = 565
  AND pokemon = 'Carracosta'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Archen at level 37.'
WHERE "pokedexNumber" = 567
  AND pokemon = 'Archeops'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Trubbish at level 36.'
WHERE "pokedexNumber" = 569
  AND pokemon = 'Garbodor'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Zorua at level 30.'
WHERE "pokedexNumber" = 571
  AND pokemon = 'Zoroark'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Minccino using Shiny Stone.'
WHERE "pokedexNumber" = 573
  AND pokemon = 'Cinccino'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gothita at level 32.'
WHERE "pokedexNumber" = 575
  AND pokemon = 'Gothorita'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gothorita at level 41.'
WHERE "pokedexNumber" = 576
  AND pokemon = 'Gothitelle'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Solosis at level 32.'
WHERE "pokedexNumber" = 578
  AND pokemon = 'Duosion'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Duosion at level 41.'
WHERE "pokedexNumber" = 579
  AND pokemon = 'Reuniclus'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Ducklett at level 35.'
WHERE "pokedexNumber" = 581
  AND pokemon = 'Swanna'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Vanillite at level 35.'
WHERE "pokedexNumber" = 583
  AND pokemon = 'Vanillish'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Vanillish at level 47.'
WHERE "pokedexNumber" = 584
  AND pokemon = 'Vanilluxe'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Deerling at level 34.'
WHERE "pokedexNumber" = 586
  AND pokemon = 'Sawsbuck'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Karrablast via trade and in exchange for Shelmet.'
WHERE "pokedexNumber" = 589
  AND pokemon = 'Escavalier'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Foongus at level 39.'
WHERE "pokedexNumber" = 591
  AND pokemon = 'Amoonguss'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Frillish at level 40.'
WHERE "pokedexNumber" = 593
  AND pokemon = 'Jellicent'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Joltik at level 36.'
WHERE "pokedexNumber" = 596
  AND pokemon = 'Galvantula'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Ferroseed at level 40.'
WHERE "pokedexNumber" = 598
  AND pokemon = 'Ferrothorn'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Klink at level 38.'
WHERE "pokedexNumber" = 600
  AND pokemon = 'Klang'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Klang at level 49.'
WHERE "pokedexNumber" = 601
  AND pokemon = 'Klinklang'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tynamo at level 39.'
WHERE "pokedexNumber" = 603
  AND pokemon = 'Eelektrik'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Eelektrik using Thunder Stone.'
WHERE "pokedexNumber" = 604
  AND pokemon = 'Eelektross'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Elgyem at level 42.'
WHERE "pokedexNumber" = 606
  AND pokemon = 'Beheeyem'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Litwick at level 41.'
WHERE "pokedexNumber" = 608
  AND pokemon = 'Lampent'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Lampent using Dusk Stone.'
WHERE "pokedexNumber" = 609
  AND pokemon = 'Chandelure'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Axew at level 38.'
WHERE "pokedexNumber" = 611
  AND pokemon = 'Fraxure'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Fraxure at level 48.'
WHERE "pokedexNumber" = 612
  AND pokemon = 'Haxorus'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cubchoo at level 37.'
WHERE "pokedexNumber" = 614
  AND pokemon = 'Beartic'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Shelmet via trade and in exchange for Karrablast.'
WHERE "pokedexNumber" = 617
  AND pokemon = 'Accelgor'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mienfoo at level 50.'
WHERE "pokedexNumber" = 620
  AND pokemon = 'Mienshao'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Golett at level 43.'
WHERE "pokedexNumber" = 623
  AND pokemon = 'Golurk'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pawniard at level 52.'
WHERE "pokedexNumber" = 625
  AND pokemon = 'Bisharp'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rufflet at level 54.'
WHERE "pokedexNumber" = 628
  AND pokemon = 'Braviary'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Vullaby at level 54.'
WHERE "pokedexNumber" = 630
  AND pokemon = 'Mandibuzz'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Deino at level 50.'
WHERE "pokedexNumber" = 634
  AND pokemon = 'Zweilous'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Zweilous at level 64.'
WHERE "pokedexNumber" = 635
  AND pokemon = 'Hydreigon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Larvesta at level 59.'
WHERE "pokedexNumber" = 637
  AND pokemon = 'Volcarona'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Chespin at level 16.'
WHERE "pokedexNumber" = 651
  AND pokemon = 'Quilladin'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Quilladin at level 36.'
WHERE "pokedexNumber" = 652
  AND pokemon = 'Chesnaught'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Fennekin at level 16.'
WHERE "pokedexNumber" = 654
  AND pokemon = 'Braixen'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Braixen at level 36.'
WHERE "pokedexNumber" = 655
  AND pokemon = 'Delphox'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Froakie at level 16.'
WHERE "pokedexNumber" = 657
  AND pokemon = 'Frogadier'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Frogadier at level 36.'
WHERE "pokedexNumber" = 658
  AND pokemon = 'Greninja'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bunnelby at level 20.'
WHERE "pokedexNumber" = 660
  AND pokemon = 'Diggersby'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Fletchling at level 17.'
WHERE "pokedexNumber" = 662
  AND pokemon = 'Fletchinder'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Fletchinder at level 35.'
WHERE "pokedexNumber" = 663
  AND pokemon = 'Talonflame'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Scatterbug at level 9.'
WHERE "pokedexNumber" = 665
  AND pokemon = 'Spewpa'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Spewpa at level 12.'
WHERE "pokedexNumber" = 666
  AND pokemon = 'Vivillon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Litleo at level 35.'
WHERE "pokedexNumber" = 668
  AND pokemon = 'Pyroar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Flabebe at level 19.'
WHERE "pokedexNumber" = 670
  AND pokemon = 'Floette'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Floette using Shiny Stone.'
WHERE "pokedexNumber" = 671
  AND pokemon = 'Florges'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Skiddo at level 32.'
WHERE "pokedexNumber" = 673
  AND pokemon = 'Gogoat'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pancham at level 32 and with a Dark-type Pokemon in party.'
WHERE "pokedexNumber" = 675
  AND pokemon = 'Pangoro'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Espurr at level 25.'
WHERE "pokedexNumber" = 678
  AND pokemon = 'Meowstic'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Honedge at level 35.'
WHERE "pokedexNumber" = 680
  AND pokemon = 'Doublade'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Doublade using Dusk Stone.'
WHERE "pokedexNumber" = 681
  AND pokemon = 'Aegislash'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Spritzee via trade and holding Sachet.'
WHERE "pokedexNumber" = 683
  AND pokemon = 'Aromatisse'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Swirlix via trade and holding Whipped Dream.'
WHERE "pokedexNumber" = 685
  AND pokemon = 'Slurpuff'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Inkay at level 30 and while the device is turned upside down.'
WHERE "pokedexNumber" = 687
  AND pokemon = 'Malamar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Binacle at level 39.'
WHERE "pokedexNumber" = 689
  AND pokemon = 'Barbaracle'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Skrelp at level 48.'
WHERE "pokedexNumber" = 691
  AND pokemon = 'Dragalge'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Clauncher at level 37.'
WHERE "pokedexNumber" = 693
  AND pokemon = 'Clawitzer'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Helioptile using Sun Stone.'
WHERE "pokedexNumber" = 695
  AND pokemon = 'Heliolisk'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tyrunt at level 39 during the day.'
WHERE "pokedexNumber" = 697
  AND pokemon = 'Tyrantrum'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Amaura at level 39 at night.'
WHERE "pokedexNumber" = 699
  AND pokemon = 'Aurorus'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Eevee when leveled up and knowing a Fairy-type move and with high affection or when leveled up and knowing a Fairy-type move and with high friendship.'
WHERE "pokedexNumber" = 700
  AND pokemon = 'Sylveon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Goomy at level 40.'
WHERE "pokedexNumber" = 705
  AND pokemon = 'Sliggoo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sliggoo at level 50 and while it is raining.'
WHERE "pokedexNumber" = 706
  AND pokemon = 'Goodra'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Phantump via trade.'
WHERE "pokedexNumber" = 709
  AND pokemon = 'Trevenant'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pumpkaboo via trade.'
WHERE "pokedexNumber" = 711
  AND pokemon = 'Gourgeist'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bergmite at level 37.'
WHERE "pokedexNumber" = 713
  AND pokemon = 'Avalugg'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Noibat at level 48.'
WHERE "pokedexNumber" = 715
  AND pokemon = 'Noivern'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rowlet at level 17.'
WHERE "pokedexNumber" = 723
  AND pokemon = 'Dartrix'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dartrix at level 34.'
WHERE "pokedexNumber" = 724
  AND pokemon = 'Decidueye'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Litten at level 17.'
WHERE "pokedexNumber" = 726
  AND pokemon = 'Torracat'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Torracat at level 34.'
WHERE "pokedexNumber" = 727
  AND pokemon = 'Incineroar'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Popplio at level 17.'
WHERE "pokedexNumber" = 729
  AND pokemon = 'Brionne'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Brionne at level 34.'
WHERE "pokedexNumber" = 730
  AND pokemon = 'Primarina'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pikipek at level 14.'
WHERE "pokedexNumber" = 732
  AND pokemon = 'Trumbeak'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Trumbeak at level 28.'
WHERE "pokedexNumber" = 733
  AND pokemon = 'Toucannon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Yungoos at level 20 during the day.'
WHERE "pokedexNumber" = 735
  AND pokemon = 'Gumshoos'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Grubbin at level 20.'
WHERE "pokedexNumber" = 737
  AND pokemon = 'Charjabug'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Charjabug when leveled up and at Vast Poni Canyon or when leveled up and at Blush Mountain or using Thunder Stone.'
WHERE "pokedexNumber" = 738
  AND pokemon = 'Vikavolt'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Crabrawler when leveled up and at Mount Lanakila or using Ice Stone.'
WHERE "pokedexNumber" = 740
  AND pokemon = 'Crabominable'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cutiefly at level 25.'
WHERE "pokedexNumber" = 743
  AND pokemon = 'Ribombee'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rockruff at level 25 during the day or at level 25 at night or at level 25 at dusk.'
WHERE "pokedexNumber" = 745
  AND pokemon = 'Lycanroc'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mareanie at level 38.'
WHERE "pokedexNumber" = 748
  AND pokemon = 'Toxapex'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mudbray at level 30.'
WHERE "pokedexNumber" = 750
  AND pokemon = 'Mudsdale'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dewpider at level 22.'
WHERE "pokedexNumber" = 752
  AND pokemon = 'Araquanid'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Fomantis at level 34 during the day.'
WHERE "pokedexNumber" = 754
  AND pokemon = 'Lurantis'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Salandit at level 33 and if female.'
WHERE "pokedexNumber" = 758
  AND pokemon = 'Salazzle'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Stufful at level 27.'
WHERE "pokedexNumber" = 760
  AND pokemon = 'Bewear'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bounsweet at level 18.'
WHERE "pokedexNumber" = 762
  AND pokemon = 'Steenee'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Steenee when leveled up and knowing Stomp.'
WHERE "pokedexNumber" = 763
  AND pokemon = 'Tsareena'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wimpod at level 30.'
WHERE "pokedexNumber" = 768
  AND pokemon = 'Golisopod'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sandygast at level 42.'
WHERE "pokedexNumber" = 770
  AND pokemon = 'Palossand'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Type: Null when leveled up and with high friendship.'
WHERE "pokedexNumber" = 773
  AND pokemon = 'Silvally'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Jangmo-o at level 35.'
WHERE "pokedexNumber" = 783
  AND pokemon = 'Hakamo-o'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Hakamo-o at level 45.'
WHERE "pokedexNumber" = 784
  AND pokemon = 'Kommo-o'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cosmog at level 43.'
WHERE "pokedexNumber" = 790
  AND pokemon = 'Cosmoem'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cosmoem at level 53.'
WHERE "pokedexNumber" = 791
  AND pokemon = 'Solgaleo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cosmoem at level 53.'
WHERE "pokedexNumber" = 792
  AND pokemon = 'Lunala'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Poipole when leveled up and knowing Dragon Pulse.'
WHERE "pokedexNumber" = 804
  AND pokemon = 'Naganadel'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Grookey at level 16.'
WHERE "pokedexNumber" = 811
  AND pokemon = 'Thwackey'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Thwackey at level 35.'
WHERE "pokedexNumber" = 812
  AND pokemon = 'Rillaboom'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Scorbunny at level 16.'
WHERE "pokedexNumber" = 814
  AND pokemon = 'Raboot'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Raboot at level 35.'
WHERE "pokedexNumber" = 815
  AND pokemon = 'Cinderace'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sobble at level 16.'
WHERE "pokedexNumber" = 817
  AND pokemon = 'Drizzile'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Drizzile at level 35.'
WHERE "pokedexNumber" = 818
  AND pokemon = 'Inteleon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Skwovet at level 24.'
WHERE "pokedexNumber" = 820
  AND pokemon = 'Greedent'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rookidee at level 18.'
WHERE "pokedexNumber" = 822
  AND pokemon = 'Corvisquire'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Corvisquire at level 38.'
WHERE "pokedexNumber" = 823
  AND pokemon = 'Corviknight'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Blipbug at level 10.'
WHERE "pokedexNumber" = 825
  AND pokemon = 'Dottler'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dottler at level 30.'
WHERE "pokedexNumber" = 826
  AND pokemon = 'Orbeetle'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nickit at level 18.'
WHERE "pokedexNumber" = 828
  AND pokemon = 'Thievul'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gossifleur at level 20.'
WHERE "pokedexNumber" = 830
  AND pokemon = 'Eldegoss'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wooloo at level 24.'
WHERE "pokedexNumber" = 832
  AND pokemon = 'Dubwool'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Chewtle at level 22.'
WHERE "pokedexNumber" = 834
  AND pokemon = 'Drednaw'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Yamper at level 25.'
WHERE "pokedexNumber" = 836
  AND pokemon = 'Boltund'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rolycoly at level 18.'
WHERE "pokedexNumber" = 838
  AND pokemon = 'Carkol'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Carkol at level 34.'
WHERE "pokedexNumber" = 839
  AND pokemon = 'Coalossal'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Applin using Tart Apple.'
WHERE "pokedexNumber" = 841
  AND pokemon = 'Flapple'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Applin using Sweet Apple.'
WHERE "pokedexNumber" = 842
  AND pokemon = 'Appletun'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Silicobra at level 36.'
WHERE "pokedexNumber" = 844
  AND pokemon = 'Sandaconda'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Arrokuda at level 26.'
WHERE "pokedexNumber" = 847
  AND pokemon = 'Barraskewda'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Toxel at level 30.'
WHERE "pokedexNumber" = 849
  AND pokemon = 'Toxtricity'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sizzlipede at level 28.'
WHERE "pokedexNumber" = 851
  AND pokemon = 'Centiskorch'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Clobbopus when leveled up and knowing Taunt.'
WHERE "pokedexNumber" = 853
  AND pokemon = 'Grapploct'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sinistea using Cracked Pot.'
WHERE "pokedexNumber" = 855
  AND pokemon = 'Polteageist'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Hatenna at level 32.'
WHERE "pokedexNumber" = 857
  AND pokemon = 'Hattrem'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Hattrem at level 42.'
WHERE "pokedexNumber" = 858
  AND pokemon = 'Hatterene'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Impidimp at level 32.'
WHERE "pokedexNumber" = 860
  AND pokemon = 'Morgrem'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Morgrem at level 42.'
WHERE "pokedexNumber" = 861
  AND pokemon = 'Grimmsnarl'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Linoone at level 35 at night.'
WHERE "pokedexNumber" = 862
  AND pokemon = 'Obstagoon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Meowth at level 28.'
WHERE "pokedexNumber" = 863
  AND pokemon = 'Perrserker'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Corsola at level 38.'
WHERE "pokedexNumber" = 864
  AND pokemon = 'Cursola'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Farfetch''d after landing three critical hits in a single battle.'
WHERE "pokedexNumber" = 865
  AND pokemon = 'Sirfetch''d'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Mr. Mime at level 42.'
WHERE "pokedexNumber" = 866
  AND pokemon = 'Mr Rime'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Yamask after taking at least 49 damage without fainting.'
WHERE "pokedexNumber" = 867
  AND pokemon = 'Runerigus'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Milcery by spinning.'
WHERE "pokedexNumber" = 869
  AND pokemon = 'Alcremie'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Snom when leveled up and at night and with high friendship.'
WHERE "pokedexNumber" = 873
  AND pokemon = 'Frosmoth'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cufant at level 34.'
WHERE "pokedexNumber" = 879
  AND pokemon = 'Copperajah'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dreepy at level 50.'
WHERE "pokedexNumber" = 886
  AND pokemon = 'Drakloak'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Drakloak at level 60.'
WHERE "pokedexNumber" = 887
  AND pokemon = 'Dragapult'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Kubfu after completing the Tower of Darkness or after completing the Tower of Waters.'
WHERE "pokedexNumber" = 892
  AND pokemon = 'Urshifu'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Stantler after using Psyshield Bash 20 times in the agile style and after using a move 20 times.'
WHERE "pokedexNumber" = 899
  AND pokemon = 'Wyrdeer'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Scyther using Black Augurite.'
WHERE "pokedexNumber" = 900
  AND pokemon = 'Kleavor'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Ursaring using Peat Block and at full-moon.'
WHERE "pokedexNumber" = 901
  AND pokemon = 'Ursaluna'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Basculin after taking at least 294 recoil damage without fainting.'
WHERE "pokedexNumber" = 902
  AND pokemon = 'Basculegion'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sneasel when leveled up and during the day and holding Razor Claw.'
WHERE "pokedexNumber" = 903
  AND pokemon = 'Sneasler'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Qwilfish after using Barb Barrage 20 times in the strong style and after using a move 20 times or when leveled up and knowing Barb Barrage or after using Barb Barrage 20 times and after using a move 20 times.'
WHERE "pokedexNumber" = 904
  AND pokemon = 'Overqwil'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sprigatito at level 16.'
WHERE "pokedexNumber" = 907
  AND pokemon = 'Floragato'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Floragato at level 36.'
WHERE "pokedexNumber" = 908
  AND pokemon = 'Meowscarada'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Fuecoco at level 16.'
WHERE "pokedexNumber" = 910
  AND pokemon = 'Crocalor'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Crocalor at level 36.'
WHERE "pokedexNumber" = 911
  AND pokemon = 'Skeledirge'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Quaxly at level 16.'
WHERE "pokedexNumber" = 913
  AND pokemon = 'Quaxwell'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Quaxwell at level 36.'
WHERE "pokedexNumber" = 914
  AND pokemon = 'Quaquaval'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Lechonk at level 18.'
WHERE "pokedexNumber" = 916
  AND pokemon = 'Oinkologne'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tarountula at level 15.'
WHERE "pokedexNumber" = 918
  AND pokemon = 'Spidops'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nymble at level 24.'
WHERE "pokedexNumber" = 920
  AND pokemon = 'Lokix'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pawmi at level 18.'
WHERE "pokedexNumber" = 922
  AND pokemon = 'Pawmo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Pawmo when leveled up and after walking 1000 steps.'
WHERE "pokedexNumber" = 923
  AND pokemon = 'Pawmot'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tandemaus by a special method.'
WHERE "pokedexNumber" = 925
  AND pokemon = 'Maushold'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Fidough at level 26.'
WHERE "pokedexNumber" = 927
  AND pokemon = 'Dachsbun'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Smoliv at level 25.'
WHERE "pokedexNumber" = 929
  AND pokemon = 'Dolliv'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dolliv at level 35.'
WHERE "pokedexNumber" = 930
  AND pokemon = 'Arboliva'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Nacli at level 24.'
WHERE "pokedexNumber" = 933
  AND pokemon = 'Naclstack'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Naclstack at level 38.'
WHERE "pokedexNumber" = 934
  AND pokemon = 'Garganacl'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Charcadet using Auspicious Armor.'
WHERE "pokedexNumber" = 936
  AND pokemon = 'Armarouge'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Charcadet using Malicious Armor.'
WHERE "pokedexNumber" = 937
  AND pokemon = 'Ceruledge'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tadbulb using Thunder Stone.'
WHERE "pokedexNumber" = 939
  AND pokemon = 'Bellibolt'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wattrel at level 25.'
WHERE "pokedexNumber" = 941
  AND pokemon = 'Kilowattrel'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Maschiff at level 30.'
WHERE "pokedexNumber" = 943
  AND pokemon = 'Mabosstiff'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Shroodle at level 28.'
WHERE "pokedexNumber" = 945
  AND pokemon = 'Grafaiai'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bramblin when leveled up and after walking 1000 steps.'
WHERE "pokedexNumber" = 947
  AND pokemon = 'Brambleghast'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Toedscool at level 30.'
WHERE "pokedexNumber" = 949
  AND pokemon = 'Toedscruel'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Capsakid using Fire Stone.'
WHERE "pokedexNumber" = 952
  AND pokemon = 'Scovillain'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rellor when leveled up and after walking 1000 steps.'
WHERE "pokedexNumber" = 954
  AND pokemon = 'Rabsca'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Flittle at level 35.'
WHERE "pokedexNumber" = 956
  AND pokemon = 'Espathra'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tinkatink at level 24.'
WHERE "pokedexNumber" = 958
  AND pokemon = 'Tinkatuff'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tinkatuff at level 38.'
WHERE "pokedexNumber" = 959
  AND pokemon = 'Tinkaton'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wiglett at level 26.'
WHERE "pokedexNumber" = 961
  AND pokemon = 'Wugtrio'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Finizen at level 38 and in multiplayer.'
WHERE "pokedexNumber" = 964
  AND pokemon = 'Palafin'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Varoom at level 40.'
WHERE "pokedexNumber" = 966
  AND pokemon = 'Revavroom'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Glimmet at level 35.'
WHERE "pokedexNumber" = 970
  AND pokemon = 'Glimmora'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Greavard at level 30 at night.'
WHERE "pokedexNumber" = 972
  AND pokemon = 'Houndstone'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Cetoddle using Ice Stone.'
WHERE "pokedexNumber" = 975
  AND pokemon = 'Cetitan'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Primeape after using Rage Fist 20 times and after using a move 20 times.'
WHERE "pokedexNumber" = 979
  AND pokemon = 'Annihilape'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Wooper at level 20.'
WHERE "pokedexNumber" = 980
  AND pokemon = 'Clodsire'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Girafarig when leveled up and knowing Twin Beam.'
WHERE "pokedexNumber" = 981
  AND pokemon = 'Farigiraf'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dunsparce when leveled up and knowing Hyper Drill.'
WHERE "pokedexNumber" = 982
  AND pokemon = 'Dudunsparce'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Bisharp after defeating three Bisharp.'
WHERE "pokedexNumber" = 983
  AND pokemon = 'Kingambit'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Frigibax at level 35.'
WHERE "pokedexNumber" = 997
  AND pokemon = 'Arctibax'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Arctibax at level 54.'
WHERE "pokedexNumber" = 998
  AND pokemon = 'Baxcalibur'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Gimmighoul after collecting Gimmighoul coins.'
WHERE "pokedexNumber" = 1000
  AND pokemon = 'Gholdengo'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Applin using a Syrupy Apple.'
WHERE "pokedexNumber" = 1011
  AND pokemon = 'Dipplin'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Poltchageist using a Teacup item (Unremarkable Teacup for Counterfeit, Masterpiece Teacup for Artisan).'
WHERE "pokedexNumber" = 1013
  AND pokemon = 'Sinistcha'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Duraludon using a Metal Alloy.'
WHERE "pokedexNumber" = 1018
  AND pokemon = 'Archaludon'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dipplin by leveling up after learning Dragon Cheer.'
WHERE "pokedexNumber" = 1019
  AND pokemon = 'Hydrapple'
  AND form IS NULL
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');
