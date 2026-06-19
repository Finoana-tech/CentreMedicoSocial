import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css'; 

const Layout = () => {
  return (
    <div className="layout-container" style={{ display: 'flex' }}>
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="main-content" style={{ flex: 1, marginLeft: '250px', minHeight: '100vh' }}>
        <div className="navbar-wrapper">
          <Navbar />
        </div>
        <main className="page-content" style={{ padding: '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
