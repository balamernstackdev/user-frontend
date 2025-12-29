import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './html/assets/css/bootstrap.min.css';
import './html/assets/css/font-awesome-pro.min.css';
import './html/assets/css/animate.min.css';
import './html/assets/css/main.css';
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
