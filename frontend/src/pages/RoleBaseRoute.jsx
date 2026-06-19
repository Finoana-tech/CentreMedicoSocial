import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 


const RoleBaseRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Si pas connecté  redirection vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si le rôle de l'utilisateur n'est pas autorisé  redirection vers "Unauthorized"
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Tout est ok  afficher le composant enfant
  return children;
};

export default RoleBaseRoute; 