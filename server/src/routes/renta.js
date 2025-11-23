const express = require('express');
const router = express.Router();

// Placeholder routes for renta, trabajador, nomina
router.get('/', (req, res) => {
  res.json({ message: 'Rentas endpoint' });
});

module.exports = router;
