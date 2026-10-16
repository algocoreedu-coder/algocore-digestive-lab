import React from 'react';
import { createRoot } from 'react-dom/client';
import RootApp from './RootApp';
import './hub/components.css';
import './hub/layouts.css';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><RootApp /></React.StrictMode>);
