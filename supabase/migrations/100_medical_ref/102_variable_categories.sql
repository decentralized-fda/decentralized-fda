-- Variable Categories
CREATE TABLE medical_ref.variable_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_singular TEXT NOT NULL,
    description TEXT,
    parent_category_id UUID,
    maximum_allowed_value DECIMAL,
    minimum_allowed_value DECIMAL,
    duration_of_action INTERVAL DEFAULT '1 day',
    onset_delay INTERVAL DEFAULT '0',
    combination_operation TEXT CHECK (combination_operation IN ('SUM', 'MEAN')) DEFAULT 'SUM',
    cause_only BOOLEAN DEFAULT FALSE,
    effect_only BOOLEAN DEFAULT FALSE,
    predictor BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    valence TEXT CHECK (valence IN ('positive', 'negative', 'neutral')),
    is_goal TEXT CHECK (is_goal IN ('ALWAYS', 'SOMETIMES', 'NEVER')),
    controllable TEXT CHECK (controllable IN ('ALWAYS', 'SOMETIMES', 'NEVER')),
    default_unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    minimum_allowed_seconds_between_measurements INTEGER,
    image_url TEXT,
    font_awesome TEXT,
    ion_icon TEXT,
    more_info TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    slug TEXT UNIQUE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add self-reference after table creation
ALTER TABLE medical_ref.variable_categories 
    ADD CONSTRAINT fk_variable_categories_parent 
    FOREIGN KEY (parent_category_id) 
    REFERENCES medical_ref.variable_categories(id) ON DELETE SET NULL;

-- Create index for slug lookups
CREATE INDEX idx_variable_categories_slug ON medical_ref.variable_categories(slug);

COMMENT ON TABLE medical_ref.variable_categories IS 'Categories of trackable variables including Treatments, Emotions, Symptoms, and Foods';
COMMENT ON COLUMN medical_ref.variable_categories.name IS 'Name of the category';
COMMENT ON COLUMN medical_ref.variable_categories.name_singular IS 'The singular version of the name';
COMMENT ON COLUMN medical_ref.variable_categories.maximum_allowed_value IS 'Maximum allowed value for variables in this category';
COMMENT ON COLUMN medical_ref.variable_categories.minimum_allowed_value IS 'Minimum allowed value for variables in this category';
COMMENT ON COLUMN medical_ref.variable_categories.duration_of_action IS 'How long the effect of a measurement in this variable typically lasts';
COMMENT ON COLUMN medical_ref.variable_categories.onset_delay IS 'How long it typically takes for a measurement in this variable to take effect';
COMMENT ON COLUMN medical_ref.variable_categories.combination_operation IS 'How to combine values of this variable (for instance, to see a summary over time)';
COMMENT ON COLUMN medical_ref.variable_categories.cause_only IS 'Indicates if this category is generally a cause in relationships';
COMMENT ON COLUMN medical_ref.variable_categories.effect_only IS 'Indicates if this category is generally an effect in relationships';
COMMENT ON COLUMN medical_ref.variable_categories.predictor IS 'Indicates if people would want to know the effects of variables in this category';
COMMENT ON COLUMN medical_ref.variable_categories.valence IS 'Whether more is better (positive), worse (negative), or neither (neutral)';
COMMENT ON COLUMN medical_ref.variable_categories.is_goal IS 'Whether variables in this category are typically goals to track';
COMMENT ON COLUMN medical_ref.variable_categories.controllable IS 'Whether variables in this category can be directly controlled';
COMMENT ON COLUMN medical_ref.variable_categories.minimum_allowed_seconds_between_measurements IS 'Minimum time required between measurements';
COMMENT ON COLUMN medical_ref.variable_categories.slug IS 'URL-friendly version of the name'; 