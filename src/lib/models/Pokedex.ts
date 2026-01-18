export interface Pokedex {
	_id: string;
	userId: string;
	name: string;
	description: string;
	isLivingDex: boolean;
	isShinyDex: boolean;
	isOriginDex: boolean;
	isFormDex: boolean;
	gameScope: string | null;
	dexScopes: string[];
}

export interface PokedexDB {
	id: string;
	userId: string;
	name: string;
	description: string;
	isLivingDex: boolean;
	isShinyDex: boolean;
	isOriginDex: boolean;
	isFormDex: boolean;
	gameScope: string | null;
	createdAt: string;
	updatedAt: string;
}
