const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv/config');

const medecinRoutes = require('./routes/medecinRoutes');
const patientRoutes = require('./routes/patientRoutes');
const medicamentRoutes = require('./routes/medicamentRoutes');
const rendezVousRoutes = require('./routes/rendezVousRoutes');
const ordonnanceRoutes = require('./routes/ordonnanceRoutes');
const ligneOrdonnanceRoutes = require('./routes/ligneOrdonnanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const utilisateurs = require('./routes/utilisateurs');

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Trop de requetes depuis cette IP, veuillez reessayer dans une minute.'
  }
});
app.use('/api/', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('Mode developpement active');
} else {
  app.use(morgan('combined'));
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur Centre Medico-Social JIRAMA operationnel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});


app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Backend Centre JIRAMA fonctionne parfaitement!',
    data: {
      port: port,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toLocaleString('fr-FR'),
      features: [
        'Gestion des rendez-vous',
        'Gestion des occupations medecins', 
        'Notifications par email',
        'Statuts temps reel',
        'Dashboard complet',
        'Gestion des disponibilites medecins'
      ]
    }
  });
});

app.use('/api/medecin', medecinRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/medicament', medicamentRoutes);
app.use('/api/rendez-vous', rendezVousRoutes);
app.use('/api/ordonnance', ordonnanceRoutes);
app.use('/api/ligne-ordonnance', ligneOrdonnanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/utilisateurs', utilisateurs);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvee',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET  /api/health',
      'GET  /api/test', 
      'POST /api/utilisateurs/login',
      'GET  /api/utilisateurs/profile',
      'POST /api/utilisateurs/logout',
      'POST /api/utilisateurs/verify-token',
      'GET  /api/utilisateurs',
      'POST /api/utilisateurs/register',
      'PUT  /api/utilisateurs/:id/actif',
      'GET  /api/medecin',
      'GET  /api/patient', 
      'GET  /api/medicament',
      'GET  /api/rendez-vous',
      'GET  /api/dashboard/stats'
    ]
  });
});

app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    })
  });
});


app.listen(port, host, () => {
  console.log('\n' + '='.repeat(60));
  console.log('CENTRE MEDICO-SOCIAL JIRAMA - SERVEUR BACKEND');
  console.log('='.repeat(60));
  
  console.log('Serveur Express demarre avec succes');
  console.log('URL: http://' + host + ':' + port);
  console.log('Environnement: ' + process.env.NODE_ENV);
  console.log('CORS configure pour: http://localhost:5173');
  console.log('CommonJS Modules actives');
  console.log('\nServeur pret - CommonJS Modules actives');
  console.log('='.repeat(60) + '\n');
});

module.exports = app;