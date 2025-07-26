export interface UserPokedex {
  id: string;
  userId: string;
  name: string;
  gameScope: 'all_games' | 'specific_generation';
  generation?: string;
  isShiny: boolean;
  requireOrigin: boolean;
  includeForms: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPokedexDB {
  id: string;
  user_id: string;
  name: string;
  game_scope: 'all_games' | 'specific_generation';
  generation?: string;
  is_shiny: boolean;
  require_origin: boolean;
  include_forms: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePokedexRequest {
  name: string;
  gameScope: 'all_games' | 'specific_generation';
  generation?: string;
  isShiny: boolean;
  requireOrigin: boolean;
  includeForms: boolean;
}

export const POKEMON_GENERATIONS = [
  { value: 'gen1', label: 'Generation 1 (Red/Blue/Yellow)' },
  { value: 'gen2', label: 'Generation 2 (Gold/Silver/Crystal)' },
  { value: 'gen3', label: 'Generation 3 (Ruby/Sapphire/Emerald)' },
  { value: 'gen4', label: 'Generation 4 (Diamond/Pearl/Platinum)' },
  { value: 'gen5', label: 'Generation 5 (Black/White)' },
  { value: 'gen6', label: 'Generation 6 (X/Y)' },
  { value: 'gen7', label: 'Generation 7 (Sun/Moon)' },
  { value: 'gen8', label: 'Generation 8 (Sword/Shield)' },
  { value: 'gen9', label: 'Generation 9 (Scarlet/Violet)' }
] as const;
