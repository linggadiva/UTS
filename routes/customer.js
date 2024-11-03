// File: routes/customer.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// Dashboard - Read All
router.get('/dashboard', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM commissions ORDER BY created_at DESC';
    db.query(sql, (err, commissions) => {
        if (err) throw err;
        res.render('dashboard', { 
            user: req.session.user,
            commissions: commissions,
            message: req.session.message
        });
        delete req.session.message;
    });
});

// Create Commission
router.post('/commission/add', isAuthenticated, (req, res) => {
    const { customer_name, art_type, description, price } = req.body;
    const sql = 'INSERT INTO commissions (customer_name, art_type, description, price, status) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [customer_name, art_type, description, price, 'pending'], (err, result) => {
        if (err) {
            req.session.message = { type: 'error', text: 'Failed to add commission' };
        } else {
            req.session.message = { type: 'success', text: 'Commission added successfully' };
        }
        res.redirect('/customer/dashboard');
    });
});

// Show Edit Form
router.get('/commission/edit/:id', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM commissions WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err || result.length === 0) {
            req.session.message = { type: 'error', text: 'Commission not found' };
            res.redirect('/customer/dashboard');
        } else {
            res.render('edit', {
                user: req.session.user,
                commission: result[0]
            });
        }
    });
});

// Update Commission
router.post('/commission/update/:id', isAuthenticated, (req, res) => {
    const { customer_name, art_type, description, price, status } = req.body;
    const sql = 'UPDATE commissions SET customer_name = ?, art_type = ?, description = ?, price = ?, status = ? WHERE id = ?';
    db.query(sql, [customer_name, art_type, description, price, status, req.params.id], (err, result) => {
        if (err) {
            req.session.message = { type: 'error', text: 'Failed to update commission' };
        } else {
            req.session.message = { type: 'success', text: 'Commission updated successfully' };
        }
        res.redirect('/customer/dashboard');
    });
});

// Delete Commission
router.post('/commission/delete/:id', isAuthenticated, (req, res) => {
    const sql = 'DELETE FROM commissions WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            req.session.message = { type: 'error', text: 'Failed to delete commission' };
        } else {
            req.session.message = { type: 'success', text: 'Commission deleted successfully' };
        }
        res.redirect('/customer/dashboard');
    });
});

module.exports = router;