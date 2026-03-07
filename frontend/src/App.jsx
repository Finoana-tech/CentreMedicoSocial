// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/common/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Medecins from './pages/Medecins';
import RendezVous from './pages/RendezVous';
import Ordonnances from './pages/Ordonnances';
import Medicaments from './pages/Medicaments';
import ProfileUser from './pages/profileUser';
import RoleBaseRoute from './pages/RoleBaseRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import RendezVousForm from './components/rendez_vous/RendezVousForm';
import RendezVousStats from './components/rendez_vous/RendezVousStats';

// ✅ Nouvelles pages pour mot de passe oublié et reset
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ✅ Nouvelle page utilisateurs
import Utilisateurs from './pages/Utilisateurs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route publique pour le login */}
          <Route path="/login" element={<Login />} />

          {/* Routes pour mot de passe oublié / réinitialisation */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Routes protégées avec layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route 
              path="dashboard" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'medecin', 'assistant', 'pharmacien']}>
                  <Dashboard />
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="patients" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'medecin', 'assistant']}>
                  <Patients />
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="medecins" 
              element={
                <RoleBaseRoute allowedRoles={['admin']}>
                  <Medecins />
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="rendez-vous" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'medecin', 'assistant']}>
                  <RendezVous />
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="rendez-vous/nouveau" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'assistant']}>
                  <RendezVousForm />
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="rendez-vous/modifier/:id" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'assistant']}>
                  <RendezVousForm />
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="rendez-vous/statistiques" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'assistant']}>
                  <RendezVousStats />
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="rendez-vous/agenda" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'medecin', 'assistant']}>
                  <div className="p-4 text-center">
                    <h3>Agenda - En développement</h3>
                    <p>Cette fonctionnalité sera disponible prochainement.</p>
                  </div>
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="ordonnances" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'medecin', 'pharmacien']}>
                  <Ordonnances />
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="medicaments" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'pharmacien']}>
                  <Medicaments />
                </RoleBaseRoute>
              } 
            />

            <Route 
              path="profile" 
              element={
                <RoleBaseRoute allowedRoles={['admin', 'medecin', 'assistant', 'pharmacien']}>
                  <ProfileUser />
                </RoleBaseRoute>
              } 
            />

            {/* ✅ Nouvelle route utilisateurs */}
            <Route 
              path="utilisateurs"
              element={
                <RoleBaseRoute allowedRoles={['admin']}>
                  <Utilisateurs />
                </RoleBaseRoute>
              }
            />
          </Route>

          {/* Route de fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
