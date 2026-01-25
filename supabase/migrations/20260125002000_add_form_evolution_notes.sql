UPDATE pokemon
SET "catchInformation" = ARRAY['Route 8, Memorial Hill, Akala Outskirts, Route 10, Tapu Village, Route 14, Route 15, Route 16, Route 17, Mount Lanakila, Poni Plains']
WHERE "pokedexNumber" = 20
  AND pokemon = 'Raticate'
  AND form = 'Alolan'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET notes = 'Event (powersaves)'
WHERE "pokedexNumber" = 25
  AND pokemon = 'Pikachu'
  AND form = 'Alola Cap'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (powersaves)'
WHERE "pokedexNumber" = 25
  AND pokemon = 'Pikachu'
  AND form = 'Hoenn Cap'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (powersaves)'
WHERE "pokedexNumber" = 25
  AND pokemon = 'Pikachu'
  AND form = 'Kalos Cap'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (powersaves)'
WHERE "pokedexNumber" = 25
  AND pokemon = 'Pikachu'
  AND form = 'Original Cap'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (pkhex)'
WHERE "pokedexNumber" = 25
  AND pokemon = 'Pikachu'
  AND form = 'Partner Cap'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (powersaves)'
WHERE "pokedexNumber" = 25
  AND pokemon = 'Pikachu'
  AND form = 'Sinnoh Cap'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (powersaves)'
WHERE "pokedexNumber" = 25
  AND pokemon = 'Pikachu'
  AND form = 'Unova Cap'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (pkhex)'
WHERE "pokedexNumber" = 25
  AND pokemon = 'Pikachu'
  AND form = 'World Cap'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves via Ice Stone.'
WHERE "pokedexNumber" = 27
  AND pokemon = 'Sandshrew'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Tapu Village, Route 14, Mount Lanakila Ultra Moon only.']
WHERE "pokedexNumber" = 27
  AND pokemon = 'Sandshrew'
  AND form = 'Alolan'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sandshrew with an ice stone'
WHERE "pokedexNumber" = 28
  AND pokemon = 'Sandslash'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves via Ice Stone.'
WHERE "pokedexNumber" = 37
  AND pokemon = 'Vulpix'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Tapu Village, Route 14, Mount Lanakila Ultra Sun only.']
WHERE "pokedexNumber" = 37
  AND pokemon = 'Vulpix'
  AND form = 'Alolan'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Vulpix with an ice stone'
WHERE "pokedexNumber" = 38
  AND pokemon = 'Ninetales'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves via level-up with high happiness.'
WHERE "pokedexNumber" = 53
  AND pokemon = 'Persian'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Malie Garden, or Meowth: Route 2, Hau’oli City (Shopping District), Hau’oli City (Marina), Route 1 (Trainers’ School), Malie Garden']
WHERE "pokedexNumber" = 53
  AND pokemon = 'Persian'
  AND form = 'Alolan'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Cobalt Coastlands: Windbreak Stand, Veilstone Cape, massive mass outbreaks (Hisuian Form)']
WHERE "pokedexNumber" = 58
  AND pokemon = 'Growlithe'
  AND form = 'Hisuian'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Growlithe with a fire stone'
WHERE "pokedexNumber" = 59
  AND pokemon = 'Arcanine'
  AND form = 'Hisuian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves at level 25'
WHERE "pokedexNumber" = 74
  AND pokemon = 'Geodude'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Route 12 and Blush Mountain,']
WHERE "pokedexNumber" = 74
  AND pokemon = 'Geodude'
  AND form = 'Alolan'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Geodude at level 25'
WHERE "pokedexNumber" = 75
  AND pokemon = 'Graveler'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Graveler by trading'
WHERE "pokedexNumber" = 76
  AND pokemon = 'Golem'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Route 5, Giant''s Mirror (Galarian Form) Dusty Bowl, North Lake Miloch, Stony Wilderness (Max Raid Battle) (Galarian Form)']
WHERE "pokedexNumber" = 83
  AND pokemon = 'Farfetch’d'
  AND form = 'Galarian'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves at level 38.'
WHERE "pokedexNumber" = 88
  AND pokemon = 'Grimer'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Hau’oli City (Shopping District), Hau’oli City (Marina), Route 1 (Trainers’ School), Malie City, Malie City (Outer Cape)']
WHERE "pokedexNumber" = 88
  AND pokemon = 'Grimer'
  AND form = 'Alolan'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Grimer at level 38'
WHERE "pokedexNumber" = 89
  AND pokemon = 'Muk'
  AND form = 'Alolan'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Coronet Highlands: Celestica Ruins (in boxes), Sacred Plaza (also in boxes), massive mass outbreaks (Hisuian Form)']
WHERE "pokedexNumber" = 100
  AND pokemon = 'Voltorb'
  AND form = 'Hisuian'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Voltorb with a leaf stone'
WHERE "pokedexNumber" = 101
  AND pokemon = 'Electrode'
  AND form = 'Hisuian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Quilava at level 36'
WHERE "pokedexNumber" = 157
  AND pokemon = 'Typhlosion'
  AND form = 'Hisuian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Poliwhirl when traded while holding a King''s Rock'
WHERE "pokedexNumber" = 186
  AND pokemon = 'Politoed'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Route 7, 6pm-4am']
WHERE "pokedexNumber" = 198
  AND pokemon = 'Murkrow'
  AND form = 'Female'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Dark Cave, Blackthorn City Entrance, 6pm-4am']
WHERE "pokedexNumber" = 202
  AND pokemon = 'Wobbuffet'
  AND form = 'Female'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Route 43']
WHERE "pokedexNumber" = 203
  AND pokemon = 'Girafarig'
  AND form = 'Female'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Route 45']
WHERE "pokedexNumber" = 207
  AND pokemon = 'Gligar'
  AND form = 'Female'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Onix when traded while holding a Metal Coat.'
WHERE "pokedexNumber" = 208
  AND pokemon = 'Steelix'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Obsidian Fieldlands: near Ramanas Island (Hisuian Form)
 Cobalt Coastlands: near Bathers'' Lagoon, near Hideaway Bay, near Tombolo Walk, near Sand''s Reach, Tranquility Cove, Islespy Shore and nearby (additional Alpha icon.', 'png), Lunker''s Lair, near Seagrass Haven, near Firespit Island, massive mass outbreaks (Hisuian Form)']
WHERE "pokedexNumber" = 211
  AND pokemon = 'Qwilfish'
  AND form = 'Hisuian'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Scyther when traded while holding a Metal Coat.'
WHERE "pokedexNumber" = 212
  AND pokemon = 'Scizor'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Ice Path, b3f, 6pm-4am']
WHERE "pokedexNumber" = 215
  AND pokemon = 'Sneasel'
  AND form = 'Female'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Coronet Highlands: near Celestica Trail, near Primeval Grotto, massive mass outbreaks (Hisuian Form)
 Alabaster Icelands: near Avalugg''s Legacy (additional Alpha icon.']
WHERE "pokedexNumber" = 215
  AND pokemon = 'Sneasel'
  AND form = 'Female-Hisuian'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET notes = 'png), Glacier Terrace, near Pearl Settlement (Hisuian Form)'
WHERE "pokedexNumber" = 215
  AND pokemon = 'Sneasel'
  AND form = 'Female-Hisuian'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Coronet Highlands: near Celestica Trail, near Primeval Grotto, massive mass outbreaks (Hisuian Form)
 Alabaster Icelands: near Avalugg''s Legacy (additional Alpha icon.']
WHERE "pokedexNumber" = 215
  AND pokemon = 'Sneasel'
  AND form = 'Hisuian'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET notes = 'png), Glacier Terrace, near Pearl Settlement (Hisuian Form)'
WHERE "pokedexNumber" = 215
  AND pokemon = 'Sneasel'
  AND form = 'Hisuian'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from remoraid'
WHERE "pokedexNumber" = 224
  AND pokemon = 'Octillery'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves at level 20'
WHERE "pokedexNumber" = 264
  AND pokemon = 'Linoone'
  AND form = 'Galarian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET notes = 'Need to catch a female Feebas for this one attach a Prism Scale, which in Generation VI is only available in X & Y, to Feebas and trade it, it will evolve into Milotic.'
WHERE "pokedexNumber" = 350
  AND pokemon = 'Milotic'
  AND form = 'Female'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Route 107 Seaweed Diving Route 124 Seaweed Diving Route 126 Seaweed Diving Route 128 Seaweed Diving Route 129 Seaweed Diving Route 130 Seaweed Diving']
WHERE "pokedexNumber" = 369
  AND pokemon = 'Relicanth'
  AND form = 'Female'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Roselia when exposed to a Shiny Stone.'
WHERE "pokedexNumber" = 407
  AND pokemon = 'Roserade'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Aipom when leveled up while knowing Double Hit.'
WHERE "pokedexNumber" = 424
  AND pokemon = 'Ambipom'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Sneasel when leveled up while holding a Razor Claw during the night.'
WHERE "pokedexNumber" = 461
  AND pokemon = 'Weavile'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Rhydon when traded while holding a Protector.'
WHERE "pokedexNumber" = 464
  AND pokemon = 'Rhyperior'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Tangela when leveled up while knowing Ancient Power.'
WHERE "pokedexNumber" = 465
  AND pokemon = 'Tangrowth'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Piloswine when leveled up while knowing Ancient Power.'
WHERE "pokedexNumber" = 473
  AND pokemon = 'Mamoswine'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET notes = 'Needs to have its form changed in PLA to be able to keep it in Home, which requires having a completed Sword or Shield save file'
WHERE "pokedexNumber" = 492
  AND pokemon = 'Shaymin'
  AND form = 'Sky Form'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = '36'
WHERE "pokedexNumber" = 503
  AND pokemon = 'Samurott'
  AND form = 'Hisuian'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Tranquill at level 32'
WHERE "pokedexNumber" = 521
  AND pokemon = 'Unfezant'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves into Hisuian Lilligant when exposed to a Sun Stone.'
WHERE "pokedexNumber" = 549
  AND pokemon = 'Lilligant'
  AND form = 'Hisuian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET notes = 'In Hisui, Petilil'
WHERE "pokedexNumber" = 549
  AND pokemon = 'Lilligant'
  AND form = 'Hisuian'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Routes 1, 3, 6, 11, 14, Striaton City, Wellspring Cave, Pinwheel Forest, Dragonspiral Tower, Challenger''s Cave, Victory Road, Village Bridge, Giant Chasm, Abundant Shrine, Lostlorn Forest (Surfing or fishing) (Red-Striped Form) (Rippling water) (Blue-Striped Form)']
WHERE "pokedexNumber" = 550
  AND pokemon = 'Basculin'
  AND form = 'Blue-striped'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Routes 1, 3, 6, 11, 14, Striaton City, Wellspring Cave, Pinwheel Forest, Dragonspiral Tower, Challenger''s Cave, Victory Road, Village Bridge, Giant Chasm, Abundant Shrine, Lostlorn Forest (Surfing or fishing) (Red-Striped Form) (Rippling water) (Blue-Striped Form)']
WHERE "pokedexNumber" = 550
  AND pokemon = 'Basculin'
  AND form = 'Red-striped'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Cobalt Coastlands: Tranquility Cove, near Islespy Shore, near Firespit Island, massive mass outbreaks (White-Striped Form)
 Coronet Highlands: Fabled Spring (White-Striped Form)
 Alabaster Icelands: near Avalugg''s Legacy, Heart''s Crag, Lake Acuity, near Pearl Settlement (White-Striped Form)']
WHERE "pokedexNumber" = 550
  AND pokemon = 'Basculin'
  AND form = 'White-striped'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Routes 8 and 10 (Galarian Form) Dusty Bowl, Giant''s Cap, Hammerlocke Hills, Lake of Outrage, Stony Wilderness (Max Raid Battle) (Galarian Form)']
WHERE "pokedexNumber" = 554
  AND pokemon = 'Darumaka'
  AND form = 'Galarian'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Darumake when exposed to an Ice Stone.'
WHERE "pokedexNumber" = 555
  AND pokemon = 'Darmanitan'
  AND form = 'Galarian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Alabaster Icelands: near Avalugg''s Legacy (mass outbreaks), near Glacier Terrace, Icepeak Cavern, massive mass outbreaks (Hisuian Form)']
WHERE "pokedexNumber" = 570
  AND pokemon = 'Zorua'
  AND form = 'Hisuian'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Zorua at level 30'
WHERE "pokedexNumber" = 571
  AND pokemon = 'Zoroark'
  AND form = 'Hisuian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Deerling at level 34'
WHERE "pokedexNumber" = 586
  AND pokemon = 'Sawsbuck'
  AND form = 'Spring'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Routes 4, 17, and 18, Driftveil City, P2 Laboratory (Surfing)']
WHERE "pokedexNumber" = 592
  AND pokemon = 'Frillish'
  AND form = 'Female'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Frillish at level 40'
WHERE "pokedexNumber" = 593
  AND pokemon = 'Jellicent'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Rufflet at level 54'
WHERE "pokedexNumber" = 628
  AND pokemon = 'Braviary'
  AND form = 'Hisuian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET notes = 'https://bulbapedia. bulbagarden. net/wiki/Roaming_Pok%C3%A9mon#Generation_V_2'
WHERE "pokedexNumber" = 641
  AND pokemon = 'Tornadus'
  AND form = 'Incarnate Form'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Only available via pokemon dream radar'
WHERE "pokedexNumber" = 641
  AND pokemon = 'Tornadus'
  AND form = 'Therian Form'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'https://bulbapedia. bulbagarden. net/wiki/Roaming_Pok%C3%A9mon#Generation_V_2'
WHERE "pokedexNumber" = 642
  AND pokemon = 'Thundurus'
  AND form = 'Incarnate Form'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Only available via pokemon dream radar'
WHERE "pokedexNumber" = 642
  AND pokemon = 'Thundurus'
  AND form = 'Therian Form'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Abundant Shrine (requires Tornadus and Thundurus in party) (Only one) (Incarnate Forme)']
WHERE "pokedexNumber" = 645
  AND pokemon = 'Landorus'
  AND form = 'Incarnate Form'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET notes = 'Only available via pokemon dream radar'
WHERE "pokedexNumber" = 645
  AND pokemon = 'Landorus'
  AND form = 'Therian Form'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'DNS Exploit'
WHERE "pokedexNumber" = 647
  AND pokemon = 'Keldeo'
  AND form = 'Resolute Form'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (X/Y)'
WHERE "pokedexNumber" = 666
  AND pokemon = 'Vivillon'
  AND form = 'Fancy (Event)'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Link to full list of Vivillon regions for XY/USUM (Friend Safari)'
WHERE "pokedexNumber" = 666
  AND pokemon = 'Vivillon'
  AND form = 'Icy Snow (Canada-Northwest Territories)'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event'
WHERE "pokedexNumber" = 666
  AND pokemon = 'Vivillon'
  AND form = 'Pokeball (Event)'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Note: Listed locations are not exclusive and had preference for locations compatible with US 3Ds systems. Check full list for other world 3DS sytems.'
WHERE "pokedexNumber" = 666
  AND pokemon = 'Vivillon'
  AND form = 'Polar (Canada-Alberta)'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'If priority is having same OT, use GO postcards in S/V to obtain unobtaiable forms'
WHERE "pokedexNumber" = 666
  AND pokemon = 'Vivillon'
  AND form = 'Tundra (Japan-Aomori)'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Route 4 - Red Flowers Route 4 - Red Flowers Route 4 - Red Flowers Route 4 - Yellow Flowers Route 4 - Yellow Flowers Route 4 - Yellow Flowers Route 7 - Grass Route 7 - Grass Route 7 - Purple Flowers Route 7 - Purple Flowers Route 7 - Purple Flowers Route 7 - Yellow Flowers Route 7 - Yellow Flowers Route 7 - Yellow Flowers']
WHERE "pokedexNumber" = 669
  AND pokemon = 'Flabébé'
  AND form = 'Red'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Goomy at level 40'
WHERE "pokedexNumber" = 705
  AND pokemon = 'Sliggoo'
  AND form = 'Hisuian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Sliggoo at level 50 during rain or fog in the overworld'
WHERE "pokedexNumber" = 706
  AND pokemon = 'Goodra'
  AND form = 'Hisuian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Route 16 - Tall Grass Route 16 - Tall Grass Route 16 - Tall Grass Route 16 - Tall Grass Friend Safari']
WHERE "pokedexNumber" = 710
  AND pokemon = 'Pumpkaboo'
  AND form = 'Small'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Terminus Cave - B3F - Interact']
WHERE "pokedexNumber" = 718
  AND pokemon = 'Zygarde'
  AND form = '50%'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET notes = 'Event (powersaves)'
WHERE "pokedexNumber" = 720
  AND pokemon = 'Hoopa'
  AND form = 'Confined'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (powersaves), convert form in USUM, then transfer to bank'
WHERE "pokedexNumber" = 720
  AND pokemon = 'Hoopa'
  AND form = 'Unbound'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from Dartrix at level 36'
WHERE "pokedexNumber" = 724
  AND pokemon = 'Decidueye'
  AND form = 'Hisuian'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Melemele Meadow, Route 6, Ula’ula Meadow, Poni Meadow']
WHERE "pokedexNumber" = 741
  AND pokemon = 'Oricorio'
  AND form = 'Baile (Red)'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Melemele Meadow, Route 6, Ula’ula Meadow, Poni Meadow']
WHERE "pokedexNumber" = 741
  AND pokemon = 'Oricorio'
  AND form = 'Pa''u (pink)'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Melemele Meadow, Route 6, Ula’ula Meadow, Poni Meadow']
WHERE "pokedexNumber" = 741
  AND pokemon = 'Oricorio'
  AND form = 'Sensu (purple)'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET notes = 'Event (powersaves)'
WHERE "pokedexNumber" = 744
  AND pokemon = 'Rockruff'
  AND form = 'Own Tempo'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Vast Poni Canyon']
WHERE "pokedexNumber" = 745
  AND pokemon = 'Lycanroc'
  AND form = 'Dusk'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Vast Poni Canyon']
WHERE "pokedexNumber" = 745
  AND pokemon = 'Lycanroc'
  AND form = 'Midday'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Mount Hokulani']
WHERE "pokedexNumber" = 774
  AND pokemon = 'Minior'
  AND form = 'Blue'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Mount Hokulani']
WHERE "pokedexNumber" = 774
  AND pokemon = 'Minior'
  AND form = 'Green'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Mount Hokulani']
WHERE "pokedexNumber" = 774
  AND pokemon = 'Minior'
  AND form = 'Orange'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Mount Hokulani']
WHERE "pokedexNumber" = 774
  AND pokemon = 'Minior'
  AND form = 'Red'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Mount Hokulani']
WHERE "pokedexNumber" = 774
  AND pokemon = 'Minior'
  AND form = 'Yellow'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "catchInformation" = ARRAY['Mount Hokulani']
WHERE "pokedexNumber" = 775
  AND pokemon = 'Minior'
  AND form = 'Indigo'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET notes = 'Get a complete national dex in Pokemon Home'
WHERE "pokedexNumber" = 803
  AND pokemon = 'Magearna'
  AND form = 'Original Color'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Can obtain Star and Ribbon Sweets via Cram-o-matic'
WHERE "pokedexNumber" = 869
  AND pokemon = 'Alcremie'
  AND form = 'Vanilla Berry'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'One must be Gigantamaxed'
WHERE "pokedexNumber" = 869
  AND pokemon = 'Alcremie'
  AND form = 'Vanilla Strawberry'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'Event (unobtainable at time of writing) - maybe possible in pkhex?'
WHERE "pokedexNumber" = 893
  AND pokemon = 'Zarude'
  AND form = 'Dada'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "catchInformation" = ARRAY['Expansion Pass: Timeless Woods (only one) (Bloodmoon)']
WHERE "pokedexNumber" = 901
  AND pokemon = 'Ursaluna'
  AND form = 'Bloodmoon'
  AND ("catchInformation" IS NULL OR array_length("catchInformation", 1) IS NULL);

UPDATE pokemon
SET "evolutionInformation" = 'Evolves from white-striped Basculin when leveled up after losing at least 294 HP from recoil damage without fainting.'
WHERE "pokedexNumber" = 902
  AND pokemon = 'Basculegion'
  AND form = 'Female'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET notes = 'Crimson Mirelands: Scarlet Bog (Only one) (Incarnate Forme)'
WHERE "pokedexNumber" = 905
  AND pokemon = 'Enamorus'
  AND form = 'Incarnate Form'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET notes = 'While it is not known to evolve into or from any Pokémon, Enamorus has a second form activated by using the Reveal Glass. Its original form, Incarnate Forme, will then become Therian Forme.'
WHERE "pokedexNumber" = 905
  AND pokemon = 'Enamorus'
  AND form = 'Therian Form'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Dunsparce when leveled up while knowing Hyper Drill. Evolves, it has a 1/100 chance of evolving into Three-Segment Form Dudunsparce.'
WHERE "pokedexNumber" = 982
  AND pokemon = 'Dudunsparce'
  AND form = '2-Segment'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET notes = 'Dudunsparce has two separate forms: Two-Segment Form and Three-Segment Form. When Dunsparce'
WHERE "pokedexNumber" = 982
  AND pokemon = 'Dudunsparce'
  AND form = '2-Segment'
  AND (notes IS NULL OR BTRIM(notes) = '');

UPDATE pokemon
SET "evolutionInformation" = 'It evolves from Dunsparce when leveled up while knowing Hyper Drill. Evolves, it has a 1/100 chance of evolving into Three-Segment Form Dudunsparce.'
WHERE "pokedexNumber" = 982
  AND pokemon = 'Dudunsparce'
  AND form = '3-Segment'
  AND ("evolutionInformation" IS NULL OR BTRIM("evolutionInformation") = '');

UPDATE pokemon
SET notes = 'Dudunsparce has two separate forms: Two-Segment Form and Three-Segment Form. When Dunsparce'
WHERE "pokedexNumber" = 982
  AND pokemon = 'Dudunsparce'
  AND form = '3-Segment'
  AND (notes IS NULL OR BTRIM(notes) = '');
