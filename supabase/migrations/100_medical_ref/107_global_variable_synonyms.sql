-- Global Variable Synonyms
--
-- Defines alternative names and translations for global medical variables.
-- This table supports:
-- * Common alternative names (e.g., "Vitamin C" for "Ascorbic Acid")
-- * Brand names (e.g., "Tylenol" for "Acetaminophen")
-- * Abbreviations (e.g., "BP" for "Blood Pressure")
-- * Translations in different languages
-- * Regional naming variations
--
CREATE TABLE medical_ref.global_variable_synonyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    synonym TEXT NOT NULL,           -- Alternative name or translation
    language TEXT NOT NULL DEFAULT 'en',  -- ISO 639-1 language code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(global_variable_id, synonym, language)
);

COMMENT ON TABLE medical_ref.global_variable_synonyms IS 'Alternative names and translations for global medical variables, supporting multiple languages and regional variations';
COMMENT ON COLUMN medical_ref.global_variable_synonyms.global_variable_id IS 'Reference to the canonical variable';
COMMENT ON COLUMN medical_ref.global_variable_synonyms.synonym IS 'Alternative name, translation, or abbreviation for the variable';
COMMENT ON COLUMN medical_ref.global_variable_synonyms.language IS 'ISO 639-1 language code (e.g., en, es, fr)'; 