import React from 'react';
import './App.css'; // We will use this file for specific component styles

// Importing the  component
import WelcomePage from './pages/WelcomePage';

function App() {
  return (
    <div className="main-container">
      <WelcomePage />
    </div>
  );
}

export default App;