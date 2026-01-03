import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async';
import './html/assets/css/bootstrap.min.css';
import './html/assets/css/bootstrap.min.css';
import './html/assets/css/animate.min.css';
import './html/assets/css/main.css';
import App from './App.jsx'
import './index.css'

import { SettingsProvider } from './context/SettingsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HelmetProvider>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </HelmetProvider>
    </BrowserRouter>,
)
