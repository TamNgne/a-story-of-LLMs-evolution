// /client/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage/HomePage';
import AboutPage from './pages/AboutPage/AboutPage';
import PlaygroundPage from './pages/PlaygroundPage/PlaygroundPage';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
      </Routes>
    </>
  );
}

export default App;

