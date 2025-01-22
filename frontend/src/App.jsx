import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import AddPlaylist from './pages/AddPlaylist.jsx';
import PlaylistDetail from './pages/PlaylistDetail.jsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddPlaylist />} />
          <Route path="/playlist/:id" element={<PlaylistDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
