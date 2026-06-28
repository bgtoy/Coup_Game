import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactModal from 'react-modal';
import './index.css';
import App from './App';

ReactModal.setAppElement('#root');

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
