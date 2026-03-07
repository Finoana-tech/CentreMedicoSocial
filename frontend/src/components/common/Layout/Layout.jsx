// src/components/common/Layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css'; // Si tu as un CSS spécifique

const Layout = () => {
  return (
    <div className="layout-container" style={{ display: 'flex' }}>
      {/* Sidebar fixe à gauche */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      
      {/* Contenu principal */}
      <div className="main-content" style={{ flex: 1, marginLeft: '250px', minHeight: '100vh' }}>
        {/* Navbar en haut */}
        <div className="navbar-wrapper">
          <Navbar />
        </div>
        
        {/* Contenu des pages */}
        <main className="page-content" style={{ padding: '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
