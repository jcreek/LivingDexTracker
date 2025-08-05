// Test data management for BDD scenarios
export const testData = {
  users: {
    testUser: {
      email: 'test@livingdextracker.com',
      password: 'TestPassword123!'
    }
  },
  
  pokedexes: {
    testKantoDex: {
      name: 'Test Kanto Living Dex',
      description: 'A test pokédex for Kanto region',
      regions: ['kanto'],
      isShinyHunt: false,
      requireOriginRegion: false,
      includeForms: false
    },
    
    testMultiRegionDex: {
      name: 'Test Multi-Region Dex',
      description: 'A test pokédex covering multiple regions',
      regions: ['kanto', 'johto'],
      isShinyHunt: true,
      requireOriginRegion: true,
      includeForms: true
    }
  },

  pokemon: {
    pikachu: {
      id: 25,
      name: 'Pikachu',
      nationalDexNumber: 25
    },
    bulbasaur: {
      id: 1,
      name: 'Bulbasaur',
      nationalDexNumber: 1
    },
    charizard: {
      id: 6,
      name: 'Charizard',
      nationalDexNumber: 6
    }
  }
};

// Helper functions for test data setup
export function getRandomTestEmail() {
  const timestamp = Date.now();
  return `test${timestamp}@livingdextracker.com`;
}

export function getRandomPokedexName() {
  const timestamp = Date.now();
  return `Test Pokédex ${timestamp}`;
}

// Test environment detection
export function isTestEnvironment() {
  return process.env.NODE_ENV === 'test' || 
         process.env.CUCUMBER_ENVIRONMENT === 'test' ||
         process.argv.includes('--test');
}