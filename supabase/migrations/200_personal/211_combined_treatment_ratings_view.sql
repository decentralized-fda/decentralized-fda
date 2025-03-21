-- Combined Treatment Ratings View
--
-- Combines user-reported and external treatment effectiveness ratings
-- into a single view for easier querying and analysis
--
CREATE VIEW personal.combined_treatment_ratings AS
WITH user_ratings AS (
    SELECT 
        user_id,
        treatment_variable_id,
        condition_variable_id,
        effectiveness_rating * 20 as normalized_effectiveness_score, -- Convert 1-5 to 0-100 scale
        side_effect_rating,
        adherence_rating,
        cost_rating,
        review_text,
        created_at,
        updated_at,
        'USER_REPORTED' as rating_source
    FROM personal.user_treatment_effectiveness_ratings
    WHERE deleted_at IS NULL
),
external_ratings AS (
    SELECT 
        user_id,
        treatment_variable_id,
        condition_variable_id,
        effectiveness_score as normalized_effectiveness_score,
        NULL as side_effect_rating,
        NULL as adherence_rating,
        NULL as cost_rating,
        snippet_text as review_text,
        created_at,
        updated_at,
        'EXTERNAL_' || data_source as rating_source
    FROM personal.user_external_treatment_effectiveness_ratings
    WHERE deleted_at IS NULL
)
SELECT * FROM user_ratings
UNION ALL
SELECT * FROM external_ratings; 