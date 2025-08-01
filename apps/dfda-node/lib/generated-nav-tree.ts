// This file is auto-generated by scripts/generate-nav-tree.ts
// Do not edit this file directly.

import type { NavItem } from './types/navigation';

// --- Generated Interface --- START
export interface GeneratedNavTree {
  readonly 'admin': NavItem;
  readonly 'conditions': NavItem;
  readonly 'conditions_globalvariableid_trials': NavItem;
  readonly 'contact': NavItem;
  readonly 'developer': NavItem;
  readonly 'developers': NavItem;
  readonly 'developers_documentation': NavItem;
  readonly 'find_trials': NavItem;
  readonly 'forgot_password': NavItem;
  readonly 'impact': NavItem;
  readonly 'login': NavItem;
  readonly 'oauth_authorize': NavItem;
  readonly 'outcome_labels': NavItem;
  readonly 'outcome_labels_predictorvariableid': NavItem;
  readonly 'patient': NavItem;
  readonly 'patient_conditions': NavItem;
  readonly 'patient_conditions_patientconditionid': NavItem;
  readonly 'patient_conditions_patientconditionid_treatment_ratings': NavItem;
  readonly 'patient_data_submission': NavItem;
  readonly 'patient_join_trial_treatment_condition': NavItem;
  readonly 'patient_onboarding': NavItem;
  readonly 'patient_onboarding_treatments': NavItem;
  readonly 'patient_reminders': NavItem;
  readonly 'patient_reminders_uservariableid': NavItem;
  readonly 'patient_treatments': NavItem;
  readonly 'patient_treatments_patienttreatmentid': NavItem;
  readonly 'patient_treatments_patienttreatmentid_ratings': NavItem;
  readonly 'patient_treatments_patienttreatmentid_side_effects': NavItem;
  readonly 'patient_trial_details_id': NavItem;
  readonly 'patient_trial_payment_id': NavItem;
  readonly 'patient_user_variables': NavItem;
  readonly 'patient_user_variables_uservariableid': NavItem;
  readonly 'privacy': NavItem;
  readonly 'provider': NavItem;
  readonly 'provider_ehr_authorization_patientid': NavItem;
  readonly 'provider_form_management_create': NavItem;
  readonly 'provider_intervention_assignment_patientid': NavItem;
  readonly 'provider_patients': NavItem;
  readonly 'provider_patients_id_enroll': NavItem;
  readonly 'providers': NavItem;
  readonly 'register': NavItem;
  readonly 'research_partner': NavItem;
  readonly 'research_partner_create_trial': NavItem;
  readonly 'research_partner_trials_id_results': NavItem;
  readonly 'root': NavItem;
  readonly 'select_role': NavItem;
  readonly 'terms': NavItem;
  readonly 'treatments': NavItem;
  readonly 'treatments_globalvariableid': NavItem;
  readonly 'update_password': NavItem;
  readonly 'user_profile': NavItem;
  readonly 'user_settings': NavItem;
}
// --- Generated Interface --- END

// Maps snake_case path keys to navigation info
export const navigationTreeObject: GeneratedNavTree = {
  "root": {
    "title": "Home",
    "href": "/",
    "description": "Go to the homepage.",
    "emoji": "🏠"
  },
  "admin": {
    "title": "Admin Panel",
    "href": "/admin",
    "description": "Manage site settings and user access.",
    "emoji": "🛡️"
  },
  "conditions": {
    "title": "Conditions",
    "href": "/conditions",
    "description": "View available conditions.",
    "emoji": "⚕️"
  },
  "conditions_globalvariableid_trials": {
    "title": "Condition Trials",
    "href": "/conditions/[globalVariableId]/trials",
    "description": "View and manage trials related to a specific condition.",
    "emoji": "🧪"
  },
  "contact": {
    "title": "Contact Us",
    "href": "/contact",
    "description": "Get in touch with us.",
    "emoji": "✉️"
  },
  "developer": {
    "title": "Developer",
    "href": "/developer",
    "description": "Developer resources.",
    "emoji": "💻"
  },
  "developers": {
    "title": "Developers",
    "href": "/developers",
    "description": "Information for developers.",
    "emoji": "🧑‍💻"
  },
  "developers_documentation": {
    "title": "Documentation",
    "href": "/developers/documentation",
    "description": "Developer documentation.",
    "emoji": "📖"
  },
  "find_trials": {
    "title": "Find Trials",
    "href": "/find-trials",
    "description": "Search for clinical trials.",
    "emoji": "🔍"
  },
  "forgot_password": {
    "title": "Forgot Password",
    "href": "/forgot-password",
    "description": "Reset your password.",
    "emoji": "🔑"
  },
  "impact": {
    "title": "Impact",
    "href": "/impact",
    "description": "See our impact.",
    "emoji": "📊"
  },
  "login": {
    "title": "Login",
    "href": "/login",
    "description": "Log in to your account.",
    "emoji": "➡️"
  },
  "oauth_authorize": {
    "title": "Authorize OAuth Application",
    "href": "/oauth/authorize",
    "description": "Authorize a third-party application to access your account data.",
    "emoji": "🔑"
  },
  "outcome_labels": {
    "title": "Outcome Labels",
    "href": "/outcome-labels",
    "description": "View outcome labels.",
    "emoji": "🏷️"
  },
  "outcome_labels_predictorvariableid": {
    "title": "Outcome Labels",
    "href": "/outcome-labels/[predictorVariableId]",
    "description": "Manage outcome labels for a specific predictor variable.",
    "emoji": "🏷️"
  },
  "patient": {
    "title": "Dashboard",
    "href": "/patient",
    "description": "Patient portal.",
    "emoji": "🧑‍⚕️"
  },
  "patient_conditions": {
    "title": "Conditions",
    "href": "/patient/conditions",
    "description": "View your conditions.",
    "emoji": "😷"
  },
  "patient_conditions_patientconditionid": {
    "title": "Patient Condition Details",
    "href": "/patient/conditions/[patientConditionId]",
    "description": "View and manage details for a specific patient's condition.",
    "emoji": "🩺"
  },
  "patient_conditions_patientconditionid_treatment_ratings": {
    "title": "Treatment Ratings",
    "href": "/patient/conditions/[patientConditionId]/treatment-ratings",
    "description": "View and manage treatment ratings for a specific patient's condition.",
    "emoji": "⭐"
  },
  "patient_data_submission": {
    "title": "Data Submission",
    "href": "/patient/data-submission",
    "description": "Submit your data.",
    "emoji": "⬆️"
  },
  "patient_join_trial_treatment_condition": {
    "title": "Join Trial",
    "href": "/patient/join-trial/[treatment]/[condition]",
    "description": "Join a clinical trial.",
    "emoji": "➕"
  },
  "patient_onboarding": {
    "title": "Onboarding",
    "href": "/patient/onboarding",
    "description": "Patient onboarding process.",
    "emoji": "🌱"
  },
  "patient_onboarding_treatments": {
    "title": "Treatments",
    "href": "/patient/onboarding/treatments",
    "description": "View available treatments.",
    "emoji": "💊"
  },
  "patient_reminders": {
    "title": "Reminders",
    "href": "/patient/reminders",
    "description": "View and manage reminders for patients.",
    "emoji": "⏰"
  },
  "patient_reminders_uservariableid": {
    "title": "Reminder Details",
    "href": "/patient/reminders/[userVariableId]",
    "description": "View and manage details for a specific reminder.",
    "emoji": "🗓️"
  },
  "patient_treatments": {
    "title": "Treatments",
    "href": "/patient/treatments",
    "description": "View your treatments.",
    "emoji": "💉"
  },
  "patient_treatments_patienttreatmentid": {
    "title": "Treatment Details",
    "href": "/patient/treatments/[patientTreatmentId]",
    "description": "View treatment details.",
    "emoji": "ℹ️"
  },
  "patient_treatments_patienttreatmentid_ratings": {
    "title": "Treatment Ratings",
    "href": "/patient/treatments/[patientTreatmentId]/ratings",
    "description": "View and manage ratings for this treatment.",
    "emoji": "⭐"
  },
  "patient_treatments_patienttreatmentid_side_effects": {
    "title": "Side Effects",
    "href": "/patient/treatments/[patientTreatmentId]/side-effects",
    "description": "View and manage reported side effects for this treatment.",
    "emoji": "💊"
  },
  "patient_trial_details_id": {
    "title": "Trial Details",
    "href": "/patient/trial-details/[id]",
    "description": "View trial details.",
    "emoji": "🔎"
  },
  "patient_trial_payment_id": {
    "title": "Trial Payment",
    "href": "/patient/trial-payment/[id]",
    "description": "Manage trial payments.",
    "emoji": "💰"
  },
  "patient_user_variables": {
    "title": "Patient User Variables",
    "href": "/patient/user-variables",
    "description": "View and manage patient user variables.",
    "emoji": "👤"
  },
  "patient_user_variables_uservariableid": {
    "title": "Patient User Variable Details",
    "href": "/patient/user-variables/[userVariableId]",
    "description": "View details of a specific patient user variable.",
    "emoji": "👤"
  },
  "privacy": {
    "title": "Privacy Policy",
    "href": "/privacy",
    "description": "View our privacy policy.",
    "emoji": "🔒"
  },
  "provider": {
    "title": "Provider",
    "href": "/provider",
    "description": "Provider portal.",
    "emoji": "👨‍⚕️"
  },
  "provider_ehr_authorization_patientid": {
    "title": "EHR Authorization",
    "href": "/provider/ehr-authorization/[patientId]",
    "description": "Authorize EHR access.",
    "emoji": "🔑"
  },
  "provider_form_management_create": {
    "title": "Create Form",
    "href": "/provider/form-management/create",
    "description": "Create a new form.",
    "emoji": "📝"
  },
  "provider_intervention_assignment_patientid": {
    "title": "Intervention Assignment",
    "href": "/provider/intervention-assignment/[patientId]",
    "description": "Assign interventions.",
    "emoji": "⚕️"
  },
  "provider_patients": {
    "title": "Patients",
    "href": "/provider/patients",
    "description": "View your patients.",
    "emoji": "👥"
  },
  "provider_patients_id_enroll": {
    "title": "Enroll Patient",
    "href": "/provider/patients/[id]/enroll",
    "description": "Enroll a patient.",
    "emoji": "✅"
  },
  "providers": {
    "title": "Providers",
    "href": "/providers",
    "description": "Information for providers.",
    "emoji": "👨‍⚕️"
  },
  "register": {
    "title": "Register",
    "href": "/register",
    "description": "Register a new account.",
    "emoji": "➕"
  },
  "research_partner": {
    "title": "Research Partner",
    "href": "/research-partner",
    "description": "Research partner portal.",
    "emoji": "🔬"
  },
  "research_partner_create_trial": {
    "title": "Create Trial",
    "href": "/research-partner/create-trial",
    "description": "Create a new trial.",
    "emoji": "🧪"
  },
  "research_partner_trials_id_results": {
    "title": "Trial Results",
    "href": "/research-partner/trials/[id]/results",
    "description": "View trial results.",
    "emoji": "📊"
  },
  "select_role": {
    "title": "Select Role",
    "href": "/select-role",
    "description": "Choose your role.",
    "emoji": "👤"
  },
  "terms": {
    "title": "Terms of Service",
    "href": "/terms",
    "description": "View our terms of service.",
    "emoji": "📜"
  },
  "treatments": {
    "title": "Treatments",
    "href": "/treatments",
    "description": "View and manage available treatments.",
    "emoji": "💊"
  },
  "treatments_globalvariableid": {
    "title": "Dynamic Treatment",
    "href": "/treatments/[globalVariableId]",
    "description": "View and manage a specific treatment identified by its ID.",
    "emoji": "🔎"
  },
  "update_password": {
    "title": "Update Password",
    "href": "/update-password",
    "description": "Change your account password for enhanced security.",
    "emoji": "🔑"
  },
  "user_profile": {
    "title": "User Profile",
    "href": "/user/profile",
    "description": "Manage your profile.",
    "emoji": "👤"
  },
  "user_settings": {
    "title": "User Settings",
    "href": "/user/settings",
    "description": "Manage your account preferences and settings.",
    "emoji": "⚙️"
  }
};
