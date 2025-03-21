-- Variable Synonyms
--
-- Defines alternative names and translations for variables from various sources:
-- * Reference data (official names and translations)
-- * User contributions
-- * Expert knowledge
-- * Aggregated data
--
-- This table supports:
-- * Common alternative names (e.g., "Vitamin C" for "Ascorbic Acid")
-- * Brand names (e.g., "Tylenol" for "Acetaminophen")
-- * Abbreviations (e.g., "BP" for "Blood Pressure")
-- * Translations in different languages
-- * Regional naming variations
--
CREATE TABLE reference.variable_synonyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variable_id UUID NOT NULL REFERENCES reference.variables(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                -- Alternative name or translation
    language TEXT NOT NULL DEFAULT 'en',  -- ISO 639-1 language code
    source_type TEXT NOT NULL CHECK (source_type IN ('reference', 'user', 'expert', 'aggregate')),
    source_id UUID,                    -- ID of the user/expert who contributed this
    confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(variable_id, name, language, source_type)
);

-- Enable RLS
ALTER TABLE reference.variable_synonyms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view synonyms"
    ON reference.variable_synonyms FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert user contributions"
    ON reference.variable_synonyms FOR INSERT
    TO authenticated
    WITH CHECK (source_type = 'user' AND source_id = auth.uid());

CREATE POLICY "Users can update their own contributions"
    ON reference.variable_synonyms FOR UPDATE
    TO authenticated
    USING (source_type = 'user' AND source_id = auth.uid());

COMMENT ON TABLE reference.variable_synonyms IS 'Alternative names and translations for variables from various sources';
COMMENT ON COLUMN reference.variable_synonyms.variable_id IS 'Reference to the canonical variable';
COMMENT ON COLUMN reference.variable_synonyms.name IS 'Alternative name, translation, or abbreviation for the variable';
COMMENT ON COLUMN reference.variable_synonyms.language IS 'ISO 639-1 language code (e.g., en, es, fr)';
COMMENT ON COLUMN reference.variable_synonyms.source_type IS 'Origin of the synonym data (reference, user, expert, aggregate)';
COMMENT ON COLUMN reference.variable_synonyms.source_id IS 'ID of the user/expert who contributed this data';
COMMENT ON COLUMN reference.variable_synonyms.confidence_score IS 'Confidence in the accuracy of this synonym (0-1)'; 