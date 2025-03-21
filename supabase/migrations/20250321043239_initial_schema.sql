-- Drop existing schemas if they exist (in reverse order of dependencies)
DO $$ 
BEGIN
    -- Drop all schemas with CASCADE to handle dependencies
    EXECUTE 'DROP SCHEMA IF EXISTS core CASCADE';
    EXECUTE 'DROP SCHEMA IF EXISTS medical CASCADE';
    EXECUTE 'DROP SCHEMA IF EXISTS medical_ref CASCADE';
    EXECUTE 'DROP SCHEMA IF EXISTS trials CASCADE';
    EXECUTE 'DROP SCHEMA IF EXISTS commerce CASCADE';
    EXECUTE 'DROP SCHEMA IF EXISTS scheduling CASCADE';
    EXECUTE 'DROP SCHEMA IF EXISTS logistics CASCADE';
    EXECUTE 'DROP SCHEMA IF EXISTS finance CASCADE';
    
    -- Create extension for UUID generation if it doesn't exist
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
END $$;

-- Create schemas
CREATE SCHEMA core;
CREATE SCHEMA medical;
CREATE SCHEMA medical_ref;
CREATE SCHEMA trials;
CREATE SCHEMA commerce;
CREATE SCHEMA scheduling;
CREATE SCHEMA logistics;
CREATE SCHEMA finance;

-- =============================================
-- CORE SCHEMA - Users, Profiles, Common Data
-- =============================================

-- Profiles Table - Links to Supabase auth.users
CREATE TABLE core.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    organization_name TEXT,
    contact_name TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor', 'sponsor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses
CREATE TABLE core.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    address_type TEXT NOT NULL CHECK (address_type IN ('shipping', 'billing', 'both')),
    is_default BOOLEAN DEFAULT FALSE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Permissions and Access Control
CREATE TABLE core.user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('read', 'write', 'admin')),
    granted_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, resource_type, resource_id)
);

-- User Groups
CREATE TABLE core.user_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Group Members
CREATE TABLE core.user_group_members (
    group_id UUID NOT NULL REFERENCES core.user_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('member', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (group_id, user_id)
);

-- User Consents
CREATE TABLE core.user_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('data_collection', 'data_sharing', 'research_use', 'marketing', 'trial_participation')),
    protocol_id UUID, -- Will reference trials.study_protocols later
    consented BOOLEAN NOT NULL,
    consent_version TEXT NOT NULL,
    ip_address TEXT,
    consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE,
    revocation_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, consent_type, protocol_id, consent_version)
);

-- Data Sharing Agreements
CREATE TABLE core.data_sharing_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    agreement_text TEXT NOT NULL,
    version TEXT NOT NULL,
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Data Exports
CREATE TABLE core.user_data_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    export_date TIMESTAMP WITH TIME ZONE NOT NULL,
    export_format TEXT NOT NULL,
    data_types TEXT[] NOT NULL,
    date_range_start TIMESTAMP WITH TIME ZONE,
    date_range_end TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE core.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    related_resource_type TEXT,
    related_resource_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags
CREATE TABLE core.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tagged Items
CREATE TABLE core.tagged_items (
    tag_id UUID NOT NULL REFERENCES core.tags(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    item_id UUID NOT NULL,
    tagged_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    tagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (tag_id, item_type, item_id)
);

-- Audit Trail
CREATE TABLE core.audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_schema TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT CHECK (action IN ('insert', 'update', 'delete')),
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INTEGRATION CONNECTIONS - For Health Wearables
-- =============================================

-- Integration Providers
CREATE TABLE core.integration_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth2', 'api_key', 'basic_auth')),
    oauth_config JSONB,
    api_base_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Connections (using Supabase auth for OAuth)
CREATE TABLE core.integration_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES core.integration_providers(id) ON DELETE CASCADE,
    auth_provider_id TEXT, -- References auth.identities(provider_id) from Supabase
    auth_user_id TEXT, -- References auth.identities(id) from Supabase
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    connection_status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected', 'expired', 'revoked', 'error')),
    status_message TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, provider_id)
);

-- Integration Sync Logs
CREATE TABLE core.integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES core.integration_connections(id) ON DELETE CASCADE,
    sync_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    sync_completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed')),
    data_types TEXT[],
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MEDICAL_REF SCHEMA - Reference Medical Data
-- =============================================

-- Variable Categories
CREATE TABLE medical_ref.variable_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add self-reference after table creation
ALTER TABLE medical_ref.variable_categories 
    ADD CONSTRAINT fk_variable_categories_parent 
    FOREIGN KEY (parent_category_id) 
    REFERENCES medical_ref.variable_categories(id) ON DELETE SET NULL;

-- Global Variables
CREATE TABLE medical_ref.global_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES medical_ref.variable_categories(id) ON DELETE CASCADE,
    default_unit TEXT,
    
    -- Standard medical codes
    snomed_ct_code TEXT,
    icd_code TEXT,
    rxnorm_code TEXT,
    loinc_code TEXT,
    fdc_id TEXT,
    
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(name, category_id)
);

-- Variable Versions
CREATE TABLE medical_ref.variable_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES medical_ref.variable_categories(id) ON DELETE CASCADE,
    default_unit TEXT,
    snomed_ct_code TEXT,
    icd_code TEXT,
    rxnorm_code TEXT,
    loinc_code TEXT,
    fdc_id TEXT,
    changed_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    change_reason TEXT,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(variable_id, version_number)
);

-- Variable Ingredients
CREATE TABLE medical_ref.variable_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    ingredient_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    amount DECIMAL,
    unit TEXT,
    proportion DECIMAL,
    is_active_ingredient BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(parent_variable_id, ingredient_variable_id),
    CONSTRAINT no_self_reference CHECK (parent_variable_id != ingredient_variable_id)
);

-- Variable Relationships
CREATE TABLE medical_ref.variable_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    target_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('correlates_with', 'contraindicated_with', 'treats', 'prevents', 'causes', 'exacerbates', 'diagnostic_for')),
    strength DECIMAL,
    evidence_level TEXT CHECK (evidence_level IN ('anecdotal', 'observational', 'clinical_trial', 'meta_analysis')),
    source_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(source_variable_id, target_variable_id, relationship_type),
    CONSTRAINT no_self_relationship CHECK (source_variable_id != target_variable_id)
);

-- Variable Synonyms
CREATE TABLE medical_ref.variable_synonyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    synonym TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(variable_id, synonym, language)
);

-- Units of Measurement
CREATE TABLE medical_ref.units_of_measurement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    symbol TEXT NOT NULL,
    unit_type TEXT NOT NULL,
    conversion_factor DECIMAL,
    base_unit_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add self-reference after table creation
ALTER TABLE medical_ref.units_of_measurement 
    ADD CONSTRAINT fk_units_base_unit 
    FOREIGN KEY (base_unit_id) 
    REFERENCES medical_ref.units_of_measurement(id) ON DELETE SET NULL;

-- Data Quality Rules
CREATE TABLE medical_ref.data_quality_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    rule_type TEXT CHECK (rule_type IN ('range', 'pattern', 'required', 'unique', 'custom')),
    min_value DECIMAL,
    max_value DECIMAL,
    pattern TEXT,
    error_message TEXT NOT NULL,
    is_warning BOOLEAN DEFAULT FALSE,
    custom_validation_function TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Tests
CREATE TABLE medical_ref.lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    loinc_code TEXT,
    test_type TEXT NOT NULL,
    specimen_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MEDICAL SCHEMA - User Medical Data
-- =============================================

-- User Variables
CREATE TABLE medical.user_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    custom_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, global_variable_id)
);

-- Measurement Batches
CREATE TABLE medical.measurement_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    integration_sync_id UUID REFERENCES core.integration_sync_logs(id) ON DELETE SET NULL,
    import_date TIMESTAMP WITH TIME ZONE NOT NULL,
    record_count INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Measurements
CREATE TABLE medical.measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    user_variable_id UUID REFERENCES medical.user_variables(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    value DECIMAL,
    unit TEXT,
    duration_minutes INTEGER,
    notes TEXT,
    source TEXT,
    source_id TEXT,
    batch_id UUID REFERENCES medical.measurement_batches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Variable Relationships
CREATE TABLE medical.user_variable_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    reported_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    cause_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    cause_measurement_id UUID REFERENCES medical.measurements(id) ON DELETE SET NULL,
    
    effect_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    effect_measurement_id UUID REFERENCES medical.measurements(id) ON DELETE SET NULL,
    
    effect_size TEXT CHECK (effect_size IN ('much_worse', 'worse', 'no_change', 'better', 'much_better')),
    confidence INTEGER CHECK (confidence BETWEEN 1 AND 5),
    onset_delay TEXT CHECK (onset_delay IN ('immediate', 'minutes', 'hours', 'days', 'weeks', 'unknown')),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Variable Ratings
CREATE TABLE medical.variable_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    target_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    
    effectiveness_rating TEXT NOT NULL CHECK (effectiveness_rating IN ('much_worse', 'worse', 'no_effect', 'better', 'much_better')),
    numeric_rating INTEGER CHECK (numeric_rating BETWEEN 1 AND 5),
    
    side_effects_rating TEXT CHECK (side_effects_rating IN ('none', 'mild', 'moderate', 'severe', 'intolerable')),
    ease_of_use_rating TEXT CHECK (ease_of_use_rating IN ('very_difficult', 'difficult', 'neutral', 'easy', 'very_easy')),
    cost_value_rating TEXT CHECK (cost_value_rating IN ('very_poor', 'poor', 'fair', 'good', 'excellent')),
    
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    context TEXT,
    
    title TEXT,
    review_text TEXT,
    
    is_public BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    verification_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, variable_id, target_variable_id)
);

-- Rating Votes
CREATE TABLE medical.rating_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating_id UUID NOT NULL REFERENCES medical.variable_ratings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(rating_id, user_id)
);

-- Rating Comments
CREATE TABLE medical.rating_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating_id UUID NOT NULL REFERENCES medical.variable_ratings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    parent_comment_id UUID REFERENCES medical.rating_comments(id) ON DELETE CASCADE,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rating Flags
CREATE TABLE medical.rating_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating_id UUID NOT NULL REFERENCES medical.variable_ratings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    flag_reason TEXT NOT NULL CHECK (flag_reason IN ('spam', 'offensive', 'misleading', 'off_topic', 'other')),
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    review_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(rating_id, user_id)
);

-- Prescriptions
CREATE TABLE medical.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    prescriber_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE RESTRICT,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT,
    quantity INTEGER NOT NULL,
    refills INTEGER NOT NULL DEFAULT 0,
    dispense_as_written BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    notes TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    trial_id UUID, -- Will reference trials.study_protocols later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription Fills
CREATE TABLE medical.prescription_fills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES medical.prescriptions(id) ON DELETE CASCADE,
    fill_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    quantity INTEGER NOT NULL,
    pharmacy TEXT,
    pharmacist TEXT,
    order_id UUID, -- Will reference commerce.orders later
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Test Orders
CREATE TABLE medical.lab_test_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    ordering_provider_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('ordered', 'specimen_collected', 'in_lab', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
    fasting_required BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,
    diagnosis_codes TEXT[],
    trial_id UUID, -- Will reference trials.study_protocols later
    visit_id UUID, -- Will reference trials.subject_visits later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Test Order Items
CREATE TABLE medical.lab_test_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES medical.lab_test_orders(id) ON DELETE CASCADE,
    lab_test_id UUID NOT NULL REFERENCES medical_ref.lab_tests(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Results
CREATE TABLE medical.lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES medical.lab_test_order_items(id) ON DELETE CASCADE,
    result_value TEXT NOT NULL,
    unit TEXT,
    reference_range TEXT,
    is_abnormal BOOLEAN,
    result_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    performing_lab TEXT,
    notes TEXT,
    reviewed_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    review_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TRIALS SCHEMA - Clinical Trials
-- =============================================

-- Study Protocols
CREATE TABLE trials.study_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    protocol_id TEXT NOT NULL UNIQUE,
    version TEXT NOT NULL,
    approval_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    phase TEXT CHECK (phase IN ('1', '2', '3', '4', 'n/a')),
    study_type TEXT CHECK (study_type IN ('interventional', 'observational', 'expanded_access')),
    randomized BOOLEAN DEFAULT FALSE,
    blinding TEXT CHECK (blinding IN ('open', 'single_blind', 'double_blind', 'triple_blind')),
    allocation TEXT CHECK (allocation IN ('randomized', 'non_randomized', 'n/a')),
    primary_purpose TEXT,
    primary_outcome TEXT,
    secondary_outcomes JSONB,
    inclusion_criteria JSONB,
    exclusion_criteria JSONB,
    target_enrollment INTEGER,
    sponsor_id UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    principal_investigator_id UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'pending_approval', 'approved', 'active', 'completed', 'terminated', 'withdrawn')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now add foreign key reference to core.user_consents
ALTER TABLE core.user_consents ADD CONSTRAINT fk_user_consents_protocol_id FOREIGN KEY (protocol_id) REFERENCES trials.study_protocols(id) ON DELETE SET NULL;

-- Study Arms
CREATE TABLE trials.study_arms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES trials.study_protocols(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    arm_type TEXT CHECK (arm_type IN ('experimental', 'active_comparator', 'placebo_comparator', 'sham_comparator', 'no_intervention', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Interventions
CREATE TABLE trials.study_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES trials.study_protocols(id) ON DELETE CASCADE,
    arm_id UUID NOT NULL REFERENCES trials.study_arms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    intervention_type TEXT CHECK (intervention_type IN ('drug', 'device', 'biological', 'procedure', 'radiation', 'behavioral', 'dietary_supplement', 'other')),
    variable_id UUID REFERENCES medical_ref.global_variables(id) ON DELETE SET NULL,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subject Enrollments
CREATE TABLE trials.subject_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES trials.study_protocols(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    arm_id UUID REFERENCES trials.study_arms(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('screening', 'enrolled', 'active', 'completed', 'discontinued', 'withdrawn')),
    discontinuation_reason TEXT,
    subject_number TEXT UNIQUE,
    site_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(protocol_id, subject_id)
);

-- Adverse Events
CREATE TABLE trials.adverse_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES trials.subject_enrollments(id) ON DELETE CASCADE,
    event_term TEXT NOT NULL,
    meddra_code TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    ongoing BOOLEAN DEFAULT FALSE,
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening', 'death')),
    seriousness BOOLEAN DEFAULT FALSE,
    relationship_to_treatment TEXT CHECK (relationship_to_treatment IN ('not_related', 'unlikely', 'possible', 'probable', 'definite')),
    action_taken TEXT,
    outcome TEXT CHECK (outcome IN ('recovered', 'recovering', 'not_recovered', 'recovered_with_sequelae', 'fatal', 'unknown')),
    reported_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    reported_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Visits
CREATE TABLE trials.study_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES trials.study_protocols(id) ON DELETE CASCADE,
    visit_number INTEGER NOT NULL,
    visit_name TEXT NOT NULL,
    description TEXT,
    target_day INTEGER,
    window_before INTEGER,
    window_after INTEGER,
    required_procedures JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subject Visits
CREATE TABLE trials.subject_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES trials.subject_enrollments(id) ON DELETE CASCADE,
    study_visit_id UUID NOT NULL REFERENCES trials.study_visits(id) ON DELETE CASCADE,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'missed', 'rescheduled')),
    performed_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protocol Deviations
CREATE TABLE trials.protocol_deviations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES trials.subject_enrollments(id) ON DELETE CASCADE,
    deviation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT CHECK (category IN ('inclusion_criteria', 'exclusion_criteria', 'study_procedure', 'informed_consent', 'medication', 'visit_schedule', 'other')),
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('minor', 'major')),
    corrective_action TEXT,
    preventative_action TEXT,
    reported_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Electronic Case Report Forms
CREATE TABLE trials.ecrf_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES trials.study_protocols(id) ON DELETE CASCADE,
    form_name TEXT NOT NULL,
    version TEXT NOT NULL,
    form_structure JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- eCRF Submissions
CREATE TABLE trials.ecrf_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES trials.ecrf_forms(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES trials.subject_enrollments(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES trials.subject_visits(id) ON DELETE SET NULL,
    submission_date TIMESTAMP WITH TIME ZONE NOT NULL,
    form_data JSONB NOT NULL,
    status TEXT CHECK (status IN ('draft', 'submitted', 'query', 'resolved', 'verified')),
    submitted_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Queries
CREATE TABLE trials.data_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ecrf_submission_id UUID REFERENCES trials.ecrf_submissions(id) ON DELETE CASCADE,
    measurement_id UUID REFERENCES medical.measurements(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    query_status TEXT CHECK (query_status IN ('open', 'answered', 'closed', 'cancelled')),
    raised_by UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    raised_date TIMESTAMP WITH TIME ZONE NOT NULL,
    response TEXT,
    responded_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    response_date TIMESTAMP WITH TIME ZONE,
    resolution TEXT,
    resolved_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    resolution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trial Subsidies
CREATE TABLE trials.trial_subsidies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_id UUID NOT NULL REFERENCES trials.study_protocols(id) ON DELETE CASCADE,
    subsidy_type TEXT NOT NULL CHECK (subsidy_type IN ('enrollment_fee', 'treatment_cost', 'travel', 'childcare', 'lost_wages', 'other')),
    amount DECIMAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    funding_source TEXT NOT NULL CHECK (funding_source IN ('donations', 'grants', 'sponsor', 'government', 'other')),
    donation_id UUID, -- Will reference finance.donations later
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMMERCE SCHEMA - Products and Orders
-- =============================================

-- Products
CREATE TABLE commerce.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variable_id UUID REFERENCES medical_ref.global_variables(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    product_type TEXT NOT NULL CHECK (product_type IN ('medication', 'supplement', 'device', 'test_kit', 'other')),
    sku TEXT UNIQUE,
    upc_code TEXT,
    ndc_code TEXT,
    manufacturer TEXT,
    is_prescription BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants
CREATE TABLE commerce.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES commerce.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    dosage TEXT,
    form TEXT,
    size TEXT,
    unit_count INTEGER,
    price DECIMAL NOT NULL,
    cost DECIMAL,
    inventory_count INTEGER DEFAULT 0,
    low_inventory_threshold INTEGER DEFAULT 10,
    weight_grams DECIMAL,
    dimensions_cm JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE commerce.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'approved', 'shipped', 'delivered', 'cancelled', 'refunded')),
    subtotal DECIMAL NOT NULL,
    tax DECIMAL NOT NULL DEFAULT 0,
    shipping DECIMAL NOT NULL DEFAULT 0,
    discount DECIMAL NOT NULL DEFAULT 0,
    total DECIMAL NOT NULL,
    payment_method TEXT,
    payment_id TEXT,
    notes TEXT,
    shipping_address_id UUID REFERENCES core.addresses(id) ON DELETE SET NULL,
    billing_address_id UUID REFERENCES core.addresses(id) ON DELETE SET NULL,
    prescription_id UUID REFERENCES medical.prescriptions(id) ON DELETE SET NULL,
    trial_id UUID REFERENCES trials.study_protocols(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE commerce.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES commerce.orders(id) ON DELETE CASCADE,
    product_variant_id UUID NOT NULL REFERENCES commerce.product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL NOT NULL,
    total_price DECIMAL NOT NULL,
    discount DECIMAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key reference to medical.prescription_fills
ALTER TABLE medical.prescription_fills ADD CONSTRAINT fk_prescription_fills_order_id FOREIGN KEY (order_id) REFERENCES commerce.orders(id) ON DELETE SET NULL;

-- =============================================
-- SCHEDULING SCHEMA - Appointments and Scheduling
-- =============================================

-- Appointment Types
CREATE TABLE scheduling.appointment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    color TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Schedules
CREATE TABLE scheduling.provider_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    location_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Provider Schedule Exceptions
CREATE TABLE scheduling.provider_schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    is_available BOOLEAN NOT NULL,
    start_time TIME,
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_exception_time_range CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time)
);

-- Appointments
CREATE TABLE scheduling.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_type_id UUID NOT NULL REFERENCES scheduling.appointment_types(id) ON DELETE RESTRICT,
    provider_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    location_id UUID,
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    cancellation_time TIMESTAMP WITH TIME ZONE,
    trial_id UUID REFERENCES trials.study_protocols(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES trials.subject_visits(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_appointment_time_range CHECK (start_time < end_time)
);

-- Appointment Reminders
CREATE TABLE scheduling.appointment_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES scheduling.appointments(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'push', 'in_app')),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LOGISTICS SCHEMA - Supply Chain and Shipping
-- =============================================

-- Suppliers
CREATE TABLE logistics.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address_id UUID REFERENCES core.addresses(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders
CREATE TABLE logistics.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES logistics.suppliers(id) ON DELETE RESTRICT,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'confirmed', 'partial', 'received', 'cancelled')),
    subtotal DECIMAL NOT NULL,
    tax DECIMAL NOT NULL DEFAULT 0,
    shipping DECIMAL NOT NULL DEFAULT 0,
    total DECIMAL NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Order Items
CREATE TABLE logistics.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES logistics.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES commerce.products(id) ON DELETE RESTRICT,
    product_variant_id UUID REFERENCES commerce.product_variants(id) ON DELETE RESTRICT,
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL NOT NULL,
    total_price DECIMAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'received', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Transactions
CREATE TABLE logistics.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_variant_id UUID NOT NULL REFERENCES commerce.product_variants(id) ON DELETE RESTRICT,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'return', 'adjustment', 'transfer', 'expiration')),
    quantity INTEGER NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    notes TEXT,
    batch_number TEXT,
    lot_number TEXT,
    expiration_date DATE,
    location_id UUID,
    performed_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments
CREATE TABLE logistics.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES commerce.orders(id) ON DELETE SET NULL,
    shipment_number TEXT UNIQUE NOT NULL,
    carrier TEXT NOT NULL,
    tracking_number TEXT,
    shipping_method TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'in_transit', 'delivered', 'exception', 'returned')),
    shipped_date TIMESTAMP WITH TIME ZONE,
    estimated_delivery_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    shipping_address_id UUID NOT NULL REFERENCES core.addresses(id) ON DELETE RESTRICT,
    weight_grams DECIMAL,
    dimensions_cm JSONB,
    shipping_cost DECIMAL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment Items
CREATE TABLE logistics.shipment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES logistics.shipments(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES commerce.order_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment Tracking Events
CREATE TABLE logistics.shipment_tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES logistics.shipments(id) ON DELETE CASCADE,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FINANCE SCHEMA - Payments and Donations
-- =============================================

-- Payment Methods
CREATE TABLE finance.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('credit_card', 'bank_account', 'paypal', 'other')),
    is_default BOOLEAN DEFAULT FALSE,
    nickname TEXT,
    last_four TEXT,
    expiry_date TEXT,
    card_type TEXT,
    billing_address_id UUID REFERENCES core.addresses(id) ON DELETE SET NULL,
    token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations
CREATE TABLE finance.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    amount DECIMAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    donation_type TEXT NOT NULL CHECK (donation_type IN ('general', 'trial_specific', 'condition_specific')),
    trial_id UUID REFERENCES trials.study_protocols(id) ON DELETE SET NULL,
    condition_id UUID REFERENCES medical_ref.global_variables(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_interval TEXT CHECK (recurrence_interval IN ('weekly', 'monthly', 'quarterly', 'annually')),
    transaction_id UUID, -- Will reference finance.transactions later
    message TEXT,
    display_name TEXT,
    tax_receipt_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key reference to trials.trial_subsidies
ALTER TABLE trials.trial_subsidies ADD CONSTRAINT fk_trial_subsidies_donation_id FOREIGN KEY (donation_id) REFERENCES finance.donations(id) ON DELETE SET NULL;

-- Transactions
CREATE TABLE finance.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'donation', 'subsidy', 'payout')),
    amount DECIMAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'disputed', 'refunded')),
    payment_method_id UUID REFERENCES finance.payment_methods(id) ON DELETE SET NULL,
    payment_processor TEXT,
    processor_transaction_id TEXT,
    order_id UUID REFERENCES commerce.orders(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES finance.donations(id) ON DELETE SET NULL,
    notes TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key reference to finance.donations
ALTER TABLE finance.donations ADD CONSTRAINT fk_donations_transaction_id FOREIGN KEY (transaction_id) REFERENCES finance.transactions(id) ON DELETE SET NULL;

-- Patient Subsidies
CREATE TABLE finance.patient_subsidies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    trial_id UUID NOT NULL REFERENCES trials.study_protocols(id) ON DELETE CASCADE,
    trial_subsidy_id UUID NOT NULL REFERENCES trials.trial_subsidies(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'paid', 'denied')),
    transaction_id UUID REFERENCES finance.transactions(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    approval_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADDITIONAL FOREIGN KEY REFERENCES
-- =============================================

-- Add foreign key references to medical.prescriptions
ALTER TABLE medical.prescriptions ADD CONSTRAINT fk_prescriptions_trial_id FOREIGN KEY (trial_id) REFERENCES trials.study_protocols(id) ON DELETE SET NULL;

-- Add foreign key references to medical.lab_test_orders
ALTER TABLE medical.lab_test_orders ADD CONSTRAINT fk_lab_test_orders_trial_id FOREIGN KEY (trial_id) REFERENCES trials.study_protocols(id) ON DELETE SET NULL;
ALTER TABLE medical.lab_test_orders ADD CONSTRAINT fk_lab_test_orders_visit_id FOREIGN KEY (visit_id) REFERENCES trials.subject_visits(id) ON DELETE SET NULL;

-- =============================================
-- VIEWS
-- =============================================

-- Create aggregated ratings view
CREATE OR REPLACE VIEW medical_ref.aggregated_variable_ratings AS
SELECT 
    vr.variable_id,
    vr.target_variable_id,
    gv1.name AS variable_name,
    gv2.name AS target_variable_name,
    COUNT(vr.id) AS total_ratings,

    -- Effectiveness distribution
    COUNT(CASE WHEN vr.effectiveness_rating = 'much_worse' THEN 1 END) AS much_worse_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'worse' THEN 1 END) AS worse_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'no_effect' THEN 1 END) AS no_effect_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'better' THEN 1 END) AS better_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'much_better' THEN 1 END) AS much_better_count,

    -- Average numeric rating (1-5 scale)
    AVG(vr.numeric_rating) AS avg_numeric_rating,

    -- Side effects distribution (if available)
    COUNT(CASE WHEN vr.side_effects_rating = 'none' THEN 1 END) AS no_side_effects_count,
    COUNT(CASE WHEN vr.side_effects_rating = 'mild' THEN 1 END) AS mild_side_effects_count,
    COUNT(CASE WHEN vr.side_effects_rating = 'moderate' THEN 1 END) AS moderate_side_effects_count,
    COUNT(CASE WHEN vr.side_effects_rating = 'severe' THEN 1 END) AS severe_side_effects_count,
    COUNT(CASE WHEN vr.side_effects_rating = 'intolerable' THEN 1 END) AS intolerable_side_effects_count,

    -- Verified ratings count
    COUNT(CASE WHEN vr.is_verified = TRUE THEN 1 END) AS verified_ratings_count
FROM 
    medical.variable_ratings vr
JOIN 
    medical_ref.global_variables gv1 ON vr.variable_id = gv1.id
JOIN 
    medical_ref.global_variables gv2 ON vr.target_variable_id = gv2.id
WHERE 
    vr.is_public = TRUE
GROUP BY 
    vr.variable_id, vr.target_variable_id, gv1.name, gv2.name;

-- =============================================
-- INDEXES
-- =============================================

-- Core schema indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON core.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON core.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON core.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON core.user_permissions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_group_members_user ON core.user_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_user ON core.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON core.user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON core.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_tagged_items_item ON core.tagged_items(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_record ON core.audit_trail(table_schema, table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_user ON core.integration_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_provider ON core.integration_connections(provider_id);

-- Medical_ref schema indexes
CREATE INDEX IF NOT EXISTS idx_global_variables_category ON medical_ref.global_variables(category_id);
CREATE INDEX IF NOT EXISTS idx_global_variables_name ON medical_ref.global_variables(name);
CREATE INDEX IF NOT EXISTS idx_variable_versions_variable ON medical_ref.variable_versions(variable_id);
CREATE INDEX IF NOT EXISTS idx_variable_ingredients_parent ON medical_ref.variable_ingredients(parent_variable_id);
CREATE INDEX IF NOT EXISTS idx_variable_ingredients_ingredient ON medical_ref.variable_ingredients(ingredient_variable_id);
CREATE INDEX IF NOT EXISTS idx_variable_relationships_source ON medical_ref.variable_relationships(source_variable_id);
CREATE INDEX IF NOT EXISTS idx_variable_relationships_target ON medical_ref.variable_relationships(target_variable_id);
CREATE INDEX IF NOT EXISTS idx_variable_synonyms_variable ON medical_ref.variable_synonyms(variable_id);
CREATE INDEX IF NOT EXISTS idx_variable_synonyms_synonym ON medical_ref.variable_synonyms(synonym);
CREATE INDEX IF NOT EXISTS idx_data_quality_rules_variable ON medical_ref.data_quality_rules(variable_id);

-- Medical schema indexes
CREATE INDEX IF NOT EXISTS idx_user_variables_user ON medical.user_variables(user_id);
CREATE INDEX IF NOT EXISTS idx_user_variables_global ON medical.user_variables(global_variable_id);
CREATE INDEX IF NOT EXISTS idx_measurements_user ON medical.measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_variable ON medical.measurements(variable_id);
CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON medical.measurements(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_variable_relationships_user ON medical.user_variable_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_variable_relationships_cause ON medical.user_variable_relationships(cause_variable_id);
CREATE INDEX IF NOT EXISTS idx_user_variable_relationships_effect ON medical.user_variable_relationships(effect_variable_id);
CREATE INDEX IF NOT EXISTS idx_variable_ratings_user ON medical.variable_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_variable_ratings_variable ON medical.variable_ratings(variable_id);
CREATE INDEX IF NOT EXISTS idx_variable_ratings_target ON medical.variable_ratings(target_variable_id);
CREATE INDEX IF NOT EXISTS idx_variable_ratings_effectiveness ON medical.variable_ratings(effectiveness_rating);
CREATE INDEX IF NOT EXISTS idx_rating_votes_rating ON medical.rating_votes(rating_id);
CREATE INDEX IF NOT EXISTS idx_rating_votes_user ON medical.rating_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_comments_rating ON medical.rating_comments(rating_id);
CREATE INDEX IF NOT EXISTS idx_rating_comments_user ON medical.rating_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_comments_parent ON medical.rating_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_rating_flags_rating ON medical.rating_flags(rating_id);
CREATE INDEX IF NOT EXISTS idx_rating_flags_user ON medical.rating_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_flags_status ON medical.rating_flags(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON medical.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescriber ON medical.prescriptions(prescriber_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_medication ON medical.prescriptions(medication_id);
CREATE INDEX IF NOT EXISTS idx_prescription_fills_prescription ON medical.prescription_fills(prescription_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_orders_patient ON medical.lab_test_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_orders_provider ON medical.lab_test_orders(ordering_provider_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_orders_trial ON medical.lab_test_orders(trial_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_orders_visit ON medical.lab_test_orders(visit_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_order_items_order ON medical.lab_test_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_order_items_test ON medical.lab_test_order_items(lab_test_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_order_item ON medical.lab_results(order_item_id);

-- Trials schema indexes
CREATE INDEX IF NOT EXISTS idx_study_protocols_sponsor ON trials.study_protocols(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_study_protocols_investigator ON trials.study_protocols(principal_investigator_id);
CREATE INDEX IF NOT EXISTS idx_study_protocols_status ON trials.study_protocols(status);
CREATE INDEX IF NOT EXISTS idx_study_arms_protocol ON trials.study_arms(protocol_id);
CREATE INDEX IF NOT EXISTS idx_study_interventions_protocol ON trials.study_interventions(protocol_id);
CREATE INDEX IF NOT EXISTS idx_study_interventions_arm ON trials.study_interventions(arm_id);
CREATE INDEX IF NOT EXISTS idx_study_interventions_variable ON trials.study_interventions(variable_id);
CREATE INDEX IF NOT EXISTS idx_subject_enrollments_protocol ON trials.subject_enrollments(protocol_id);
CREATE INDEX IF NOT EXISTS idx_subject_enrollments_subject ON trials.subject_enrollments(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_enrollments_arm ON trials.subject_enrollments(arm_id);
CREATE INDEX IF NOT EXISTS idx_adverse_events_enrollment ON trials.adverse_events(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_study_visits_protocol ON trials.study_visits(protocol_id);
CREATE INDEX IF NOT EXISTS idx_subject_visits_enrollment ON trials.subject_visits(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_subject_visits_study_visit ON trials.subject_visits(study_visit_id);
CREATE INDEX IF NOT EXISTS idx_protocol_deviations_enrollment ON trials.protocol_deviations(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_ecrf_forms_protocol ON trials.ecrf_forms(protocol_id);
CREATE INDEX IF NOT EXISTS idx_ecrf_submissions_form ON trials.ecrf_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_ecrf_submissions_enrollment ON trials.ecrf_submissions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_ecrf_submissions_visit ON trials.ecrf_submissions(visit_id);
CREATE INDEX IF NOT EXISTS idx_data_queries_ecrf ON trials.data_queries(ecrf_submission_id);
CREATE INDEX IF NOT EXISTS idx_data_queries_measurement ON trials.data_queries(measurement_id);
CREATE INDEX IF NOT EXISTS idx_trial_subsidies_trial ON trials.trial_subsidies(trial_id);

-- Commerce schema indexes
CREATE INDEX IF NOT EXISTS idx_products_variable ON commerce.products(variable_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON commerce.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON commerce.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_trial ON commerce.orders(trial_id);
CREATE INDEX IF NOT EXISTS idx_orders_prescription ON commerce.orders(prescription_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON commerce.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON commerce.order_items(product_variant_id);

-- Scheduling schema indexes
CREATE INDEX IF NOT EXISTS idx_provider_schedules_provider ON scheduling.provider_schedules(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_schedule_exceptions_provider ON scheduling.provider_schedule_exceptions(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider ON scheduling.appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON scheduling.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_trial ON scheduling.appointments(trial_id);
CREATE INDEX IF NOT EXISTS idx_appointments_visit ON scheduling.appointments(visit_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment ON scheduling.appointment_reminders(appointment_id);

-- Logistics schema indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON logistics.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po ON logistics.purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product ON logistics.purchase_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON logistics.inventory_transactions(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON logistics.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment ON logistics.shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_items_order_item ON logistics.shipment_items(order_item_id);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_events_shipment ON logistics.shipment_tracking_events(shipment_id);

-- Finance schema indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON finance.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON finance.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON finance.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_donation ON finance.transactions(donation_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON finance.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_trial ON finance.donations(trial_id);
CREATE INDEX IF NOT EXISTS idx_donations_condition ON finance.donations(condition_id);
CREATE INDEX IF NOT EXISTS idx_patient_subsidies_patient ON finance.patient_subsidies(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_subsidies_trial ON finance.patient_subsidies(trial_id);
CREATE INDEX IF NOT EXISTS idx_patient_subsidies_subsidy ON finance.patient_subsidies(trial_subsidy_id);

-- =============================================
-- SEED DATA - Basic categories
-- =============================================

-- Seed basic variable categories
INSERT INTO medical_ref.variable_categories (name, description) VALUES
('Conditions', 'Diseases, disorders, and health conditions'),
('Symptoms', 'Subjective experiences related to health'),
('Medications', 'Pharmaceutical drugs and treatments'),
('Supplements', 'Vitamins, minerals, and other dietary supplements'),
('Foods', 'Food items and beverages'),
('Biomarkers', 'Measurable indicators of biological state or condition'),
('Lifestyle', 'Sleep, exercise, stress, and other lifestyle elements'),
('Environment', 'Weather, pollution, and other environmental elements')
ON CONFLICT (name) DO NOTHING;

-- Add some subcategories as examples
DO $$
DECLARE
    conditions_id UUID;
    medications_id UUID;
    foods_id UUID;
BEGIN
    SELECT id INTO conditions_id FROM medical_ref.variable_categories WHERE name = 'Conditions';
    SELECT id INTO medications_id FROM medical_ref.variable_categories WHERE name = 'Medications';
    SELECT id INTO foods_id FROM medical_ref.variable_categories WHERE name = 'Foods';
    
    -- Condition subcategories
    INSERT INTO medical_ref.variable_categories (name, description, parent_category_id) VALUES
    ('Cardiovascular', 'Heart and blood vessel conditions', conditions_id),
    ('Respiratory', 'Lung and breathing conditions', conditions_id),
    ('Neurological', 'Brain and nervous system conditions', conditions_id),
    ('Gastrointestinal', 'Digestive system conditions', conditions_id),
    ('Metabolic', 'Conditions affecting metabolism', conditions_id),
    ('Immune', 'Conditions affecting the immune system', conditions_id)
    ON CONFLICT (name) DO NOTHING;
    
    -- Medication subcategories
    INSERT INTO medical_ref.variable_categories (name, description, parent_category_id) VALUES
    ('Antibiotics', 'Medications that kill or inhibit bacteria', medications_id),
    ('Antidepressants', 'Medications for depression and mood disorders', medications_id),
    ('Pain Relievers', 'Medications for pain management', medications_id),
    ('Antihistamines', 'Medications for allergies', medications_id),
    ('Antihypertensives', 'Medications for high blood pressure', medications_id),
    ('Antidiabetics', 'Medications for diabetes', medications_id)
    ON CONFLICT (name) DO NOTHING;
    
    -- Food subcategories
    INSERT INTO medical_ref.variable_categories (name, description, parent_category_id) VALUES
    ('Fruits', 'Edible fruit products', foods_id),
    ('Vegetables', 'Edible vegetable products', foods_id),
    ('Grains', 'Wheat, rice, oats, and other grain products', foods_id),
    ('Dairy', 'Milk and milk products', foods_id),
    ('Proteins', 'Meat, fish, eggs, and plant proteins', foods_id),
    ('Beverages', 'Drinks and liquid refreshments', foods_id)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- =============================================
-- INTEGRATION PROVIDERS - Common Health Wearables
-- =============================================

-- Seed common health wearable providers
INSERT INTO core.integration_providers (
    provider_name, 
    display_name, 
    description, 
    auth_type, 
    oauth_config, 
    api_base_url, 
    is_active
) VALUES 
(
    'fitbit', 
    'Fitbit', 
    'Activity, sleep, and health tracking wearables', 
    'oauth2', 
    jsonb_build_object(
        'authorization_url', 'https://www.fitbit.com/oauth2/authorize',
        'token_url', 'https://api.fitbit.com/oauth2/token',
        'scopes', array['activity', 'heartrate', 'location', 'nutrition', 'profile', 'settings', 'sleep', 'weight']
    ),
    'https://api.fitbit.com',
    true
),
(
    'garmin', 
    'Garmin', 
    'GPS and fitness tracking devices', 
    'oauth2', 
    jsonb_build_object(
        'authorization_url', 'https://connect.garmin.com/oauthConfirm',
        'token_url', 'https://connectapi.garmin.com/oauth-service/oauth/token',
        'scopes', array['fitness.activity.read', 'fitness.body_composition.read', 'fitness.location.read', 'fitness.sleep.read']
    ),
    'https://apis.garmin.com',
    true
),
(
    'apple_health', 
    'Apple Health', 
    'Health data from Apple devices', 
    'oauth2', 
    jsonb_build_object(
        'authorization_url', 'https://appleid.apple.com/auth/authorize',
        'token_url', 'https://appleid.apple.com/auth/token',
        'scopes', array['name', 'email']
    ),
    'https://api.apple.com/health',
    true
),
(
    'google_fit', 
    'Google Fit', 
    'Activity and health tracking from Google', 
    'oauth2', 
    jsonb_build_object(
        'authorization_url', 'https://accounts.google.com/o/oauth2/auth',
        'token_url', 'https://oauth2.googleapis.com/token',
        'scopes', array['https://www.googleapis.com/auth/fitness.activity.read', 'https://www.googleapis.com/auth/fitness.body.read', 'https://www.googleapis.com/auth/fitness.location.read', 'https://www.googleapis.com/auth/fitness.nutrition.read', 'https://www.googleapis.com/auth/fitness.sleep.read']
    ),
    'https://www.googleapis.com/fitness/v1/users/me',
    true
),
(
    'oura', 
    'Oura Ring', 
    'Sleep and activity tracking ring', 
    'oauth2', 
    jsonb_build_object(
        'authorization_url', 'https://cloud.ouraring.com/oauth/authorize',
        'token_url', 'https://api.ouraring.com/oauth/token',
        'scopes', array['daily', 'personal', 'heartrate', 'workout', 'session']
    ),
    'https://api.ouraring.com/v2',
    true
),
(
    'withings', 
    'Withings', 
    'Smart scales and health monitoring devices', 
    'oauth2', 
    jsonb_build_object(
        'authorization_url', 'https://account.withings.com/oauth2_user/authorize2',
        'token_url', 'https://wbsapi.withings.net/v2/oauth2',
        'scopes', array['user.info', 'user.metrics', 'user.activity']
    ),
    'https://wbsapi.withings.net',
    true
)
ON CONFLICT (provider_name) DO NOTHING;