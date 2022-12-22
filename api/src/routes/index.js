const { Router } = require('express');
const router = Router();
const axios = require('axios');
// Configurar los routers
// router.use();
const apiLink = 'https://rickandmortyapi.com/api';
const getApiInfo = async () => {
	let allData = [];
	for (let i = 0; i <= 41; i++) {
		const res = await axios.get(`${apiLink}/character`);
		// const data = res.data.results;
		allData = [...allData, ...data];
	}
	// console.log(allData[0]);
};
getApiInfo();
module.exports = router;
