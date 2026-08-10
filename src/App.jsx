import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import AnalyticsProvider from './components/Common/AnalyticsProvider';
import Layout from './components/Navigation/Layout';
import ArticleEditor from './pages/EditArticle/ArticleEditor';
import ArticleViewer from './pages/Article/ArticleViewer';
import ArticleHistory from './pages/Article/ArticleHistory';
import ArticleContainer from './pages/Article/ArticleContainer';
import Login from './pages/Auth/Login';
import Journal from './pages/Journal/Journal';
import Timeline from './pages/Timeline/Timeline';
import LoreGraph from './pages/LoreGraph/LoreGraph';

import ElysiumBoards from './pages/ElysiumBoards';
import ElysiumBoardView from './pages/ElysiumBoardView';

const WikipediaImport = () => (
  <div className="page-container">
    <h1>Import from Wikipedia</h1>
    <p>Loading wikipedia import tool...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnalyticsProvider>
          <Layout>
          <Routes>
            {/* Main page defaults to 'Main_Page' slug */}
            <Route element={<ArticleContainer />}>
              <Route path="/" element={<ArticleViewer defaultSlug="Main_Page" />} />
              <Route path="/article/:slug" element={<ArticleViewer />} />
              <Route path="/edit/:slug" element={<ArticleEditor />} />
              <Route path="/create" element={<ArticleEditor />} />
              <Route path="/history/:slug" element={<ArticleHistory />} />
            </Route>
            <Route path="/boards" element={<ElysiumBoards />} />
            <Route path="/boards/:id" element={<ElysiumBoardView />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/graph" element={<LoreGraph />} />
            <Route path="/login" element={<Login />} />
            <Route path="/import" element={<WikipediaImport />} />
          </Routes>
        </Layout>
        </AnalyticsProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
