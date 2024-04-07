import { json } from '@sveltejs/kit';
import sprites from '$lib/helpers/sprites.json';

interface PokemonSpritesData {
	[key: string]: {
		forms: {
			[key: string]: {
				is_prev_gen_icon?: boolean;
				is_alias_of?: string;
			};
		};
	};
}

export async function GET({ url }) {
	const pokedexNumber = url.searchParams.get('pokedexNumber');
	const form = url.searchParams.get('form') ?? undefined;

	if (!pokedexNumber) {
		return json({
			status: 400,
			error: 'Pokédex number is required'
		});
	}

	const spriteFileName = getPokemonSpriteFileName(pokedexNumber, form);

	if (spriteFileName) {
		// If spriteUrl is found, return it with status 200
		return json({
			status: 200,
			spriteFileName: spriteFileName
		});
	} else {
		// If spriteUrl is not found, return 404
		return json({
			status: 404,
			error: `Sprite URL not found for the specified Pokémon with Pokédex number ${pokedexNumber} and form ${form}`
		});
	}
}

function getPokemonSpriteFileName(number: string, form?: string): string | undefined {
	const spritesData: PokemonSpritesData = sprites;

	// Check if the Pokémon number exists in the sprites JSON
	if (spritesData[number] && spritesData[number]['gen-8']) {
		const forms = spritesData[number]['gen-8'].forms;
		let formName = '$';

		// If a form is provided and it exists for the Pokémon, set the form name
		if (form && forms[form]) {
			formName = form;
		}

		// Check if the form has an alias
		if (forms[formName].is_alias_of) {
			formName = forms[formName].is_alias_of;
		}

		const fileName = `${spritesData[number].slug.eng.toLowerCase()}${formName !== '$' ? '-' + formName : ''}.png`;
		return fileName;
	}

	// If the Pokémon number doesn't exist or doesn't have gen-8 sprites, return undefined
	return undefined;
}
