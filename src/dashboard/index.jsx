import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './Dashboard';
import './dashboard.css';

const root = createRoot(document.getElementById('root'));
root.render(<Dashboard />);
