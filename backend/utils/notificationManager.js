const nodemailer = require('nodemailer');

class NotificationManager {
    constructor() {
        // Configuration SMTP avec fallbacks robustes
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            // Timeouts pour éviter les blocages
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
        });

        this.verifyConfiguration();
    }

    async verifyConfiguration() {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn(' Variables SMTP non configurées - Mode simulation activé');
            this.simulationMode = true;
            return;
        }

        try {
            await this.transporter.verify();
            this.simulationMode = false;
        } catch (error) {
            console.warn(' Erreur connexion SMTP - Mode simulation activé:', error.message);
            this.simulationMode = true;
        }
    }

    formatDateForDisplay(dateTime) {
        if (!dateTime) return 'Date non spécifiée';
        try {
            const date = new Date(dateTime);
            return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error(' Erreur formatage date:', error);
            return 'Date invalide';
        }
    }

    getEmailFooter() {
        return `
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <div style="color: #666; font-size: 12px; line-height: 1.4;">
                <p><strong>Centre Médico-Social JIRAMA</strong><br>
                 +261 XX XX XXX XX<br>
                 contact@jirama-medical.mg<br>
                Adresse: [Adresse du centre]</p>
                <p style="color: #999;">Cet email est envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        `;
    }

    async envoyerEmail(destinataire, sujet, contenuHTML) {
        if (this.simulationMode) {
            console.log(' [SIMULATION] Email:', {
                to: destinataire,
                subject: sujet,
                simulated: true
            });
            return true;
        }

        const emailOptions = {
            from: `"Centre Médico-Social JIRAMA" <${process.env.SMTP_USER}>`,
            to: destinataire,
            subject: sujet,
            html: contenuHTML,
            // Headers pour améliorer la délivrabilité
            headers: {
                'X-Priority': '3',
                'X-Mailer': 'NodeMailer'
            }
        };

        try {
            const result = await this.transporter.sendMail(emailOptions);
            return true;
        } catch (error) {
            console.error(` Erreur envoi email à ${destinataire}:`, error.message);
            
            // Log détaillé pour le debug
            if (error.response) {
                console.error(' Détails erreur SMTP:', error.response);
            }
            
            return false;
        }
    }

    async envoyerNotificationRendezVous(rendezVous, patient, medecin) {
        const dateFormatee = this.formatDateForDisplay(rendezVous.date_heure);
        const duree = rendezVous.duree || 30;

        // Email au patient
        const emailPatientHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background: linear-gradient(135deg, #2c5aa0, #1e3a6b); padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;"> Confirmation de Rendez-vous</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p>Bonjour <strong style="color: #2c5aa0;">${patient.prenom} ${patient.nom}</strong>,</p>
                    <p>Votre rendez-vous a été planifié avec succès. Voici le récapitulatif :</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #2c5aa0; margin: 20px 0;">
                        <h3 style="color: #2c5aa0; margin-top: 0;">📅 Détails du rendez-vous</h3>
                        <p><strong>Date et heure :</strong> ${dateFormatee}</p>
                        <p><strong>Durée estimée :</strong> ${duree} minutes</p>
                        <p><strong>Médecin :</strong> Dr ${medecin.prenom} ${medecin.nom}</p>
                        <p><strong>Motif :</strong> ${rendezVous.motif || 'Consultation générale'}</p>
                        <p><strong>Lieu :</strong> Centre Médico-Social JIRAMA</p>
                    </div>

                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7; margin: 20px 0;">
                        <h4 style="color: #856404; margin-top: 0;">ℹ Informations importantes</h4>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Présentez-vous 10 minutes avant l'heure du rendez-vous</li>
                            <li>Apportez votre carte d'identité et carte d'assurance</li>
                            <li>En cas d'empêchement, annulez au moins 2 heures à l'avance</li>
                        </ul>
                    </div>
                </div>
                ${this.getEmailFooter()}
            </div>
        `;

        // Email au médecin
        const emailMedecinHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background: linear-gradient(135deg, #28a745, #1e7e34); padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;"> Nouveau Rendez-vous</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p>Dr <strong style="color: #28a745;">${medecin.prenom} ${medecin.nom}</strong>,</p>
                    <p>Un nouveau rendez-vous a été planifié dans votre agenda.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                        <h3 style="color: #28a745; margin-top: 0;">👤 Informations patient</h3>
                        <p><strong>Patient :</strong> ${patient.prenom} ${patient.nom}</p>
                        <p><strong>Date et heure :</strong> ${dateFormatee}</p>
                        <p><strong>Durée :</strong> ${duree} minutes</p>
                        <p><strong>Motif :</strong> ${rendezVous.motif || 'Consultation'}</p>
                    </div>

                    <p style="color: #666; font-style: italic;">Cet email est un rappel automatique de votre prochain rendez-vous.</p>
                </div>
                ${this.getEmailFooter()}
            </div>
        `;

        const results = await Promise.allSettled([
            this.envoyerEmail(patient.email, ' Confirmation de votre rendez-vous - Centre JIRAMA', emailPatientHTML),
            this.envoyerEmail(medecin.email, ` Nouveau rendez-vous avec ${patient.prenom} ${patient.nom}`, emailMedecinHTML)
        ]);

        const succes = results.every(result => result.status === 'fulfilled' && result.value);
        
        if (succes) {
            console.log(' Toutes les notifications de rendez-vous envoyées avec succès');
        } else {
            console.warn(' Certaines notifications n\'ont pas pu être envoyées');
        }

        return succes;
    }

    async envoyerNotificationAnnulation(rendezVous, patient, medecin, raison) {
        const dateFormatee = this.formatDateForDisplay(rendezVous.date_heure);

        const emailAnnulationHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background: linear-gradient(135deg, #dc3545, #c82333); padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;"> Rendez-vous Annulé</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p>Bonjour <strong style="color: #dc3545;">${patient.prenom} ${patient.nom}</strong>,</p>
                    <p>Nous vous informons que votre rendez-vous a été annulé.</p>
                    
                    <div style="background: #fff3f3; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                        <h3 style="color: #dc3545; margin-top: 0;"> Rendez-vous annulé</h3>
                        <p><strong>Date prévue :</strong> ${dateFormatee}</p>
                        <p><strong>Médecin :</strong> Dr ${medecin.prenom} ${medecin.nom}</p>
                        <p><strong>Motif initial :</strong> ${rendezVous.motif || 'Consultation'}</p>
                        <p><strong>Raison de l'annulation :</strong> ${raison || 'Non spécifiée'}</p>
                    </div>

                    <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h4 style="color: #0066cc; margin-top: 0;">🔄 Prendre un nouveau rendez-vous</h4>
                        <p>Pour planifier un nouveau rendez-vous :</p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Connectez-vous à votre espace patient</li>
                            <li>Contactez notre secrétariat au +261 XX XX XXX XX</li>
                            <li>Envoyez un email à contact@jirama-medical.mg</li>
                        </ul>
                    </div>

                    <p style="color: #666;">Nous nous excusons pour la gêne occasionnée.</p>
                </div>
                ${this.getEmailFooter()}
            </div>
        `;

        const succes = await this.envoyerEmail(
            patient.email, 
            ' Annulation de votre rendez-vous - Centre JIRAMA', 
            emailAnnulationHTML
        );

        if (succes) {
            console.log(' Notification d\'annulation envoyée avec succès');
        }

        return succes;
    }

    async envoyerNotificationOccupation(medecin, typeOccupation, duree) {
        const typesTitres = {
            'urgence': ' Occupation - Urgence Médicale',
            'administratif': ' Occupation - Tâche Administrative', 
            'pause': ' Occupation - Pause'
        };

        const titre = typesTitres[typeOccupation] || ' Occupation Médecin';

        const emailOccupationHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background: linear-gradient(135deg, #ffc107, #e0a800); padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">${titre.split(' - ')[0]}</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p><strong>${titre}</strong></p>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Médecin :</strong> Dr ${medecin.prenom} ${medecin.nom}</p>
                        <p><strong>Type :</strong> ${typeOccupation}</p>
                        <p><strong>Durée estimée :</strong> ${duree} minutes</p>
                        <p><strong>Début :</strong> ${this.formatDateForDisplay(new Date())}</p>
                    </div>

                    <p style="color: #666; font-size: 14px;">
                        Cette occupation a été enregistrée dans le système et affectera la disponibilité du médecin.
                    </p>
                </div>
                ${this.getEmailFooter()}
            </div>
        `;

        // Envoyer à l'administration/secrétariat
        const emailAdmin = process.env.ADMIN_EMAIL || medecin.email;
        
        const succes = await this.envoyerEmail(
            emailAdmin,
            titre + ' - Centre JIRAMA',
            emailOccupationHTML
        );

        if (succes) {
            console.log(` Notification occupation ${typeOccupation} envoyée`);
        }

        return succes;
    }

    async envoyerRappelRendezVous(rendezVous, patient, medecin) {
        const dateFormatee = this.formatDateForDisplay(rendezVous.date_heure);
        
        console.log(` Rappel prévu pour ${patient.prenom} ${patient.nom} le ${dateFormatee}`);
        return true;
    }
}

module.exports = NotificationManager;