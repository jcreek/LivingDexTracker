// Data seeding helper for BDD tests
// This class now simply references pre-seeded database data instead of creating it via API
export class DataSeeder {
	constructor(world) {
		this.world = world;
		this.baseUrl = world.baseUrl;

		// Pre-seeded test data UUIDs (from seed.sql)
		this.testUserId = '550e8400-e29b-41d4-a716-446655440000';
		this.testPokedexes = {
			kanto: {
				id: '550e8400-e29b-41d4-a716-446655440001',
				name: 'Test Kanto Living Dex',
				regionalPokedexName: 'kanto'
			},
			johto: {
				id: '550e8400-e29b-41d4-a716-446655440002',
				name: 'Test Johto Living Dex',
				regionalPokedexName: 'johto'
			},
			kaloscentral: {
				id: '550e8400-e29b-41d4-a716-446655440003',
				name: 'Test Kalos Central Living Dex',
				regionalPokedexName: 'kalos-central'
			},
			alola: {
				id: '550e8400-e29b-41d4-a716-446655440004',
				name: 'Test Alola Living Dex',
				regionalPokedexName: 'alola'
			},
			galar: {
				id: '550e8400-e29b-41d4-a716-446655440005',
				name: 'Test Galar Living Dex',
				regionalPokedexName: 'galar'
			},
			shiny: {
				id: '550e8400-e29b-41d4-a716-446655440006',
				name: 'Test Shiny Hunt Dex',
				regionalPokedexName: 'national'
			}
		};
	}

	async seedTestData() {
		// Data is already seeded in the database via seed.sql
		// Just set up references to the pre-seeded pokédex
		console.log('Using pre-seeded test data from database');
		this.world.testPokedex = this.testPokedexes.kanto;
		this.world.testUserId = this.testUserId;
		console.log('Test pokédex reference set:', this.world.testPokedex.id);
		return true;
	}

	async ensureTestPokedexExists() {
		// Check if we already have a test pokédex reference
		if (this.world.testPokedex) {
			console.log('Test pokédex reference already exists:', this.world.testPokedex.id);
			return this.world.testPokedex;
		}

		// Set up reference to pre-seeded primary test pokédex (Kanto)
		this.world.testPokedex = this.testPokedexes.kanto;
		console.log('Using pre-seeded primary test pokédex:', this.world.testPokedex.id);
		return this.world.testPokedex;
	}

	// Get specific test pokédex by region
	getTestPokedex(region = 'kanto') {
		return this.testPokedexes[region] || this.testPokedexes.kanto;
	}

	async cleanupTestData() {
		// No cleanup needed - database will be reset for each test run
		console.log('Test data will be reset on next test run');
	}
}
