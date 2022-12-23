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
		episode: char.episode.map((el) => el),
	};
};
const getApiInfo = async () => {
	let allData = [];
	for (let i = 0; i <= 41; i++) {
		const res = await axios.get(`${apiLink}/character`);
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
	allData = [...apiInfo, ...DbInfo];
	return allData;
};
router.get('/', async (req, res) => {
	try {
		const data = await getDbInfo();
		res.status(200).send(data);
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
