const express = require('express');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the MS Backend API (Phase 1)' });
});

// We will mount our resource routes here later:
const userRoutes = require('./routes/user.routes');
const courseRoutes = require('./routes/course.routes');
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
