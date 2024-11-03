const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

router.get('/login', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/customer/dashboard');
    } else {
        res.render('login');
    }
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
            res.render('register', { error: 'Registration failed' });
        } else {
            res.redirect('/auth/login');
        }
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err || results.length === 0) {
            res.render('login', { error: 'Invalid credentials' });
        } else {
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                req.session.loggedin = true;
                req.session.user = results[0];
                res.redirect('/customer/dashboard');
            } else {
                res.render('login', { error: 'Invalid credentials' });
            }
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;