const { Router } = require('express');
const router = Router();
const axios = require('axios');
const { Character, Episode } = require('../db.js');
// const Character = require('../models/Character');
// const Episode = require('../models/Episode');
// Configurar los routers
// router.use();
const apiLink = 'https://rickandmortyapi.com/api';
const createCharacter = (char) => {
	return {
		id: char.id,
		name: char.name,
		species: char.species,
		origin: char.origin.name,
		image: char.image,
		created: char.created,
	};
};
router.post('/character', async (req, res) => {
	const { name, species, origin, image, created, episode } = req.body;
	if (!name || !species || !origin || !created || !episode) {
		return res
			.status(400)
			.send({ error: 'You must fill up all the required fields' });
	}
	try {
		const newChar = createCharacter({
			name,
			species,
			origin,
			image,
			created,
		});
		const episodeDb = await Episode.findAll({
			where: { name: episode },
		});

		const creatingChar = await Character.create(newChar);
		creatingChar.addEpisode(episodeDb);
		res.status(200).send(newChar);
	} catch (error) {
		res.status(400).send({ error: error.message });
	}
});
const getApiInfo = async () => {
	let allData = [];
	for (let i = 1; i <= 41; i++) {
		const res = await axios.get(`${apiLink}/character?page=${i}`);
		const data = res.data.results;
		allData = [...allData, ...data];
	}
	const mapped = allData.map((el) => createCharacter(el));
	return mapped;
};

const getDbInfo = async () => {
	return await Character.findAll({
		include: {
			model: Episode,
			attributes: ['name'],
			through: {
				attributes: [],
			},
		},
	});
};

const getAllInfo = async () => {
	let allData = [];
	const apiInfo = await getApiInfo();
	const DbInfo = await getDbInfo();
	allData = [...DbInfo, ...apiInfo];
	return allData;
};

const fillDb = async () => {
	let allData = [];
	for (let i = 1; i < 4; i++) {
		const resp = await axios.get(`${apiLink}/episode?page=${i}`);
		const data = await resp.data.results;
		allData = [...allData, ...data];
	}
	const mapped = allData.map((el) => {
		return {
			id: el.id,
			name: el.name,
		};
	});
	mapped?.forEach((el) => {
		Episode.findOrCreate({
			where: { id: el.id, name: el.name },
		});
	});
};
router.get('/episodes', async (req, res) => {
	try {
		const data = await fillDb();
		const DbData = await Episode.findAll();
		res.status(200).send(DbData);
	} catch (error) {
		res.status(400).send({ error: error.message });
	}
});
router.get('/characters', async (req, res) => {
	const { name } = req.query;
	if (name) {
		try {
			const resp = await axios.get(`${apiLink}/character?name=${name}`);
			const data = await resp.data.results;
			res.status(200).send(data);
		} catch (error) {
			res.status(400).send({ error: error.message });
		}
	} else {
		try {
			const allData = await getAllInfo();
			res.status(200).send(allData);
		} catch (error) {
			res.status(400).send({ error: error.message });
		}
	}
});

module.exports = router;
