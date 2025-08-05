export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pokedex_entries: {
        Row: {
          id: number
          pokedexNumber: number
          pokemon: string
          form: string | null
          canGigantamax: boolean
          regionToCatchIn: string | null
          gamesToCatchIn: string[] | null
          regionToEvolveIn: string | null
          evolutionInformation: string | null
          catchInformation: string[] | null
          kanto_number: number | null
          johto_number: number | null
          hoenn_number: number | null
          sinnoh_number: number | null
          sinnoh_extended_number: number | null
          unova_number: number | null
          unova_updated_number: number | null
          kalos_central_number: number | null
          kalos_coastal_number: number | null
          kalos_mountain_number: number | null
          hoenn_updated_number: number | null
          alola_number: number | null
          alola_updated_number: number | null
          melemele_number: number | null
          akala_number: number | null
          ulaula_number: number | null
          poni_number: number | null
          galar_number: number | null
          isle_armor_number: number | null
          crown_tundra_number: number | null
          hisui_number: number | null
          paldea_number: number | null
          kitakami_number: number | null
          blueberry_number: number | null
          boxPlacementFormsBox: number | null
          boxPlacementFormsRow: number | null
          boxPlacementFormsColumn: number | null
          boxPlacementBox: number | null
          boxPlacementRow: number | null
          boxPlacementColumn: number | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          pokedexNumber: number
          pokemon: string
          form?: string | null
          canGigantamax?: boolean
          regionToCatchIn?: string | null
          gamesToCatchIn?: string[] | null
          regionToEvolveIn?: string | null
          evolutionInformation?: string | null
          catchInformation?: string[] | null
          kanto_number?: number | null
          johto_number?: number | null
          hoenn_number?: number | null
          sinnoh_number?: number | null
          sinnoh_extended_number?: number | null
          unova_number?: number | null
          unova_updated_number?: number | null
          kalos_central_number?: number | null
          kalos_coastal_number?: number | null
          kalos_mountain_number?: number | null
          hoenn_updated_number?: number | null
          alola_number?: number | null
          alola_updated_number?: number | null
          melemele_number?: number | null
          akala_number?: number | null
          ulaula_number?: number | null
          poni_number?: number | null
          galar_number?: number | null
          isle_armor_number?: number | null
          crown_tundra_number?: number | null
          hisui_number?: number | null
          paldea_number?: number | null
          kitakami_number?: number | null
          blueberry_number?: number | null
          boxPlacementFormsBox?: number | null
          boxPlacementFormsRow?: number | null
          boxPlacementFormsColumn?: number | null
          boxPlacementBox?: number | null
          boxPlacementRow?: number | null
          boxPlacementColumn?: number | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          pokedexNumber?: number
          pokemon?: string
          form?: string | null
          canGigantamax?: boolean
          regionToCatchIn?: string | null
          gamesToCatchIn?: string[] | null
          regionToEvolveIn?: string | null
          evolutionInformation?: string | null
          catchInformation?: string[] | null
          kanto_number?: number | null
          johto_number?: number | null
          hoenn_number?: number | null
          sinnoh_number?: number | null
          sinnoh_extended_number?: number | null
          unova_number?: number | null
          unova_updated_number?: number | null
          kalos_central_number?: number | null
          kalos_coastal_number?: number | null
          kalos_mountain_number?: number | null
          hoenn_updated_number?: number | null
          alola_number?: number | null
          alola_updated_number?: number | null
          melemele_number?: number | null
          akala_number?: number | null
          ulaula_number?: number | null
          poni_number?: number | null
          galar_number?: number | null
          isle_armor_number?: number | null
          crown_tundra_number?: number | null
          hisui_number?: number | null
          paldea_number?: number | null
          kitakami_number?: number | null
          blueberry_number?: number | null
          boxPlacementFormsBox?: number | null
          boxPlacementFormsRow?: number | null
          boxPlacementFormsColumn?: number | null
          boxPlacementBox?: number | null
          boxPlacementRow?: number | null
          boxPlacementColumn?: number | null
          createdAt?: string
          updatedAt?: string
        }
      }
      regional_pokedex_info: {
        Row: {
          id: number
          name: string
          display_name: string
          column_name: string
          region: string | null
          generation: string | null
          games: string[] | null
          total_pokemon: number | null
          pokeapi_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          display_name: string
          column_name: string
          region?: string | null
          generation?: string | null
          games?: string[] | null
          total_pokemon?: number | null
          pokeapi_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          display_name?: string
          column_name?: string
          region?: string | null
          generation?: string | null
          games?: string[] | null
          total_pokemon?: number | null
          pokeapi_id?: number | null
          created_at?: string
        }
      }
      user_pokedexes: {
        Row: {
          id: string
          user_id: string
          name: string
          game_scope: string
          regional_pokedex_id: number | null
          is_shiny: boolean
          requires_origin: boolean
          include_forms: boolean
          region: string | null
          games: string[] | null
          generation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          game_scope?: string
          regional_pokedex_id?: number | null
          is_shiny?: boolean
          requires_origin?: boolean
          include_forms?: boolean
          region?: string | null
          games?: string[] | null
          generation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          game_scope?: string
          regional_pokedex_id?: number | null
          is_shiny?: boolean
          requires_origin?: boolean
          include_forms?: boolean
          region?: string | null
          games?: string[] | null
          generation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      catch_records: {
        Row: {
          id: string
          user_pokedex_id: string
          pokedex_entry_id: number
          is_caught: boolean
          catch_status: string
          catch_location: string
          origin_region: string | null
          game_caught_in: string | null
          is_gigantamax: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_pokedex_id: string
          pokedex_entry_id: number
          is_caught?: boolean
          catch_status?: string
          catch_location?: string
          origin_region?: string | null
          game_caught_in?: string | null
          is_gigantamax?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_pokedex_id?: string
          pokedex_entry_id?: number
          is_caught?: boolean
          catch_status?: string
          catch_location?: string
          origin_region?: string | null
          game_caught_in?: string | null
          is_gigantamax?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_pokedex_stats: {
        Args: {
          pokedex_id: string
        }
        Returns: {
          total: number
          caught: number
          ready_to_evolve: number
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}