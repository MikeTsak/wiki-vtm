import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Layout from './components/Navigation/Layout';
import ArticleEditor from './pages/EditArticle/ArticleEditor';
import ArticleViewer from './pages/Article/ArticleViewer';
import Login from './pages/Auth/Login';

// Placeholder components
const Boards = () => (
  <div className="page-container">
    <h1>Boards Dashboard</h1>
    <p>Public and private brainstorming boards.</p>
  </div>
);

const Journal = () => (
  <div className="page-container">
    <h1>My Private Journal</h1>
    <p>Personal lore notes and character reflections.</p>
  </div>
);

const WikipediaImport = () => (
  <div className="page-container">
    <h1>Import from Wikipedia</h1>
    <p>Loading wikipedia import tool...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Main page defaults to 'Main_Page' slug */}
          <Route path="/" element={<ArticleViewer defaultSlug="Main_Page" />} />
          <Route path="/article/:slug" element={<ArticleViewer />} />
          <Route path="/edit/:slug" element={<ArticleEditor />} />
          <Route path="/create" element={<ArticleEditor />} />
          <Route path="/boards" element={<Boards />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/import" element={<WikipediaImport />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
