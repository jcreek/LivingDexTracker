const fs = require('fs');
const csv = require('csv-parser');

const inputFilePath = 'seed-data.tsv'; // Replace with the path to your TSV file
const outputFilePath = 'pokedex.json';

const results = [];

fs.createReadStream(inputFilePath)
	.pipe(csv({ separator: '\t' }))
	.on('data', (data) => {
		const entry = {
			pokedexNumber: parseInt(data['Dex #']),
			boxPlacement: {
				box: parseInt(data['No Form Box']),
				row: parseInt(data['No Form Row']),
				column: parseInt(data['No Form Column'])
			},
			boxPlacementForms: {
				box: parseInt(data['Home Box']),
				row: parseInt(data['Home Row']),
				column: parseInt(data['Home Column'])
			},
			pokemon: data['Pokemon'],
			form: data['Form'],
			canGigantamax: data['Can Gigantamax'].toLowerCase(),
			regionToCatchIn: data['Region'],
			gamesToCatchIn: data['Catch In These Games'].split(',').map((game) => game.trim()),
			regionToEvolveIn: data['Evolve In Region'],
			evolutionInformation: data['Evolution Info'],
			catchInformation: []
		};
		results.push(entry);
	})
	.on('end', () => {
		fs.writeFile(outputFilePath, JSON.stringify(results, null, 2), (err) => {
			if (err) {
				console.error('Error writing to JSON file', err);
			} else {
				console.log('JSON file has been successfully created');
			}
		});
	});
