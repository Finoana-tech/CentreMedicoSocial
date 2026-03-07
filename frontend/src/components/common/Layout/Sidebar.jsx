import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { BsGrid, BsHeartPulse, BsPeople, BsPersonVcard, BsCalendarCheck, BsClipboardData, BsCapsule, BsPersonFillGear, BsHospital, BsFillHospitalFill, BsHeartHalf } from 'react-icons/bs';
import { useAuth } from '../../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const SidebarLink = ({ to, icon: Icon, children }) => {
    const active = isActive(to);

    return (
      <Nav.Item>
        <Link
          to={to}
          className={`d-flex align-items-center py-2 px-3 rounded text-decoration-none ${
            active ? 'text-white' : 'text-white text-opacity-75'
          }`}
          style={{
            backgroundColor: active ? '#385BB2' : 'transparent',
            transition: 'background-color 0.2s',
          }}
        >
          <Icon size={24} className="me-3" />
          {children}
        </Link>
      </Nav.Item>
    );
  };

  // ⚡ Permissions par rôle
  const rolePermissions = {
    admin: ['dashboard','patients','medecins','rendez-vous','ordonnances','medicaments','utilisateurs'],
    medecin: ['dashboard','patients','rendez-vous','ordonnances'],
    assistant: ['dashboard','patients','rendez-vous'],
    pharmacien: ['dashboard','ordonnances','medicaments'],
  };

  if (!user) return null; // Pas d'utilisateur : Sidebar vide

  const allowed = rolePermissions[user.role] || [];

  return (
    <div
      style={{
        width: '250px',
        height: '100vh',
        backgroundColor: '#203A8D',
        color: 'white',
        padding: '20px',
        position: 'fixed',
        top: 0,
        left: 0,
        overflowY: 'auto',
      }}
    >
      <div className="d-flex align-items-center mb-5">
        <BsHeartPulse size={60} className="me-2" />
        <h5 className="mb-0">CMS JIRAMA</h5>
      </div>

      <p className="text-uppercase text-light small mb-3" style={{fontSize : '25px'}}>Menu Principal</p>

      <Nav className="flex-column">
        {allowed.includes('dashboard') && <SidebarLink to="/" icon={BsGrid}>Tableau de bord</SidebarLink>}
        {allowed.includes('patients') && <SidebarLink to="/patients" icon={BsPeople}>Patients</SidebarLink>}
        {allowed.includes('medecins') && <SidebarLink to="/medecins" icon={BsPersonVcard}>Médecins</SidebarLink>}
        {allowed.includes('rendez-vous') && <SidebarLink to="/rendez-vous" icon={BsCalendarCheck}>Rendez-vous</SidebarLink>}
        {allowed.includes('ordonnances') && <SidebarLink to="/ordonnances" icon={BsClipboardData}>Ordonnances</SidebarLink>}
        {allowed.includes('medicaments') && <SidebarLink to="/medicaments" icon={BsCapsule}>Médicaments</SidebarLink>}
        {allowed.includes('utilisateurs') && <SidebarLink to="/utilisateurs" icon={BsPersonFillGear}>Utilisateurs</SidebarLink>}
      </Nav>
    </div>
  );
};

export default Sidebar;
