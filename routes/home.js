const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        isLoggedIn: req.session.loggedin || false,
        user: req.session.user || null
    });
});

module.exports = router;