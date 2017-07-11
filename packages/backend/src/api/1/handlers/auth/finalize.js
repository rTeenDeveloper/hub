import express from 'express';

const router = express.Router();

router.get('/success', (req, res) => {
  // finalization logic, redirect to where it was queried from, etc
  res.json({ status: true });
});

router.get('/failure', (req, res) => {
  res.json({ status: false });
});

module.exports = router;
