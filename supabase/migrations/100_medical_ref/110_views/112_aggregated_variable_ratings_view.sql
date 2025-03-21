-- Create aggregated ratings materialized view
CREATE MATERIALIZED VIEW medical_ref.aggregated_variable_ratings AS
SELECT 
    vr.predictor_variable_id,
    vr.outcome_variable_id,
    gv1.name AS predictor_variable_name,
    gv2.name AS outcome_variable_name,
    COUNT(vr.id) AS total_ratings,

    -- Effectiveness distribution
    COUNT(CASE WHEN vr.effectiveness_rating = 'much_worse' THEN 1 END) AS much_worse_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'worse' THEN 1 END) AS worse_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'no_effect' THEN 1 END) AS no_effect_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'better' THEN 1 END) AS better_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'much_better' THEN 1 END) AS much_better_count,

    -- Average numeric rating (1-5 scale)
    AVG(vr.numeric_rating) AS avg_numeric_rating,

    -- Side effects distribution
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
    medical_ref.global_variables gv1 ON vr.predictor_variable_id = gv1.id
JOIN 
    medical_ref.global_variables gv2 ON vr.outcome_variable_id = gv2.id
WHERE 
    vr.is_public = TRUE
GROUP BY 
    vr.predictor_variable_id, vr.outcome_variable_id, gv1.name, gv2.name;

-- Create unique index for the materialized view
CREATE UNIQUE INDEX idx_aggregated_ratings_variables 
ON medical_ref.aggregated_variable_ratings(predictor_variable_id, outcome_variable_id); 