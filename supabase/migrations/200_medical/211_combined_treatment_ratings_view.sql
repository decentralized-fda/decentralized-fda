-- Combined Treatment Ratings View
--
-- Combines both user and external treatment effectiveness ratings into a single view
-- for unified querying and analysis.
--
CREATE OR REPLACE VIEW medical.combined_treatment_ratings AS
(
    -- User ratings
    SELECT 
        'user' as rating_source,
        id,
        user_id as rater_id,
        NULL as platform,
        NULL as platform_user_id,
        NULL as platform_post_url,
        predictor_variable_id,
        outcome_variable_id,
        effectiveness_rating,
        numeric_rating,
        side_effects_rating,
        review_text,
        NULL::decimal as sentiment_score,
        TRUE as is_verified,
        verified_by,
        created_at as reported_at,
        created_at,
        updated_at
    FROM medical.treatment_effectiveness_ratings
    WHERE is_public = true

    UNION ALL

    -- External ratings
    SELECT 
        'external' as rating_source,
        id,
        linked_user_id as rater_id,
        platform,
        platform_user_id,
        platform_post_url,
        predictor_variable_id,
        outcome_variable_id,
        effectiveness_rating,
        numeric_rating,
        side_effects_rating,
        review_text,
        sentiment_score,
        is_verified,
        verified_by,
        reported_at,
        created_at,
        updated_at
    FROM medical.external_treatment_effectiveness_ratings
); 