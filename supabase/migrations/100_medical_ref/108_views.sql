-- Create materialized view for global variable statistics
CREATE MATERIALIZED VIEW medical_ref.global_variable_stats AS
WITH measurement_stats AS (
    SELECT 
        variable_id,
        COUNT(*) as number_of_measurements,
        COUNT(DISTINCT user_id) as number_of_users,
        MIN(value) as minimum_recorded_value,
        MAX(value) as maximum_recorded_value,
        AVG(value) as mean,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median,
        MODE() WITHIN GROUP (ORDER BY value) as most_common_value,
        STDDEV(value) as standard_deviation,
        VAR_POP(value) as variance,
        MIN(measurement_time) as earliest_measurement,
        MAX(measurement_time) as latest_measurement,
        AVG(EXTRACT(EPOCH FROM (measurement_time - LAG(measurement_time) OVER (PARTITION BY user_id, variable_id ORDER BY measurement_time)))) as average_seconds_between_measurements,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY 
            EXTRACT(EPOCH FROM (measurement_time - LAG(measurement_time) OVER (PARTITION BY user_id, variable_id ORDER BY measurement_time)))
        ) as median_seconds_between_measurements
    FROM medical.variable_measurements
    GROUP BY variable_id
),
rating_stats AS (
    SELECT 
        predictor_variable_id as variable_id,
        COUNT(*) as number_of_predictor_ratings,
        COUNT(DISTINCT user_id) as number_of_rating_users
    FROM medical.variable_ratings
    GROUP BY predictor_variable_id
    UNION ALL
    SELECT 
        outcome_variable_id as variable_id,
        COUNT(*) as number_of_outcome_ratings,
        COUNT(DISTINCT user_id) as number_of_rating_users
    FROM medical.variable_ratings
    GROUP BY outcome_variable_id
),
relationship_stats AS (
    SELECT 
        predictor_variable_id as variable_id,
        COUNT(*) as number_of_relationships_as_cause
    FROM medical_ref.variable_relationships
    GROUP BY predictor_variable_id
    UNION ALL
    SELECT 
        outcome_variable_id as variable_id,
        COUNT(*) as number_of_relationships_as_effect
    FROM medical_ref.variable_relationships
    GROUP BY outcome_variable_id
)
SELECT 
    gv.id,
    gv.name,
    ms.number_of_measurements,
    ms.number_of_users,
    ms.minimum_recorded_value,
    ms.maximum_recorded_value,
    ms.mean,
    ms.median,
    ms.most_common_value,
    ms.standard_deviation,
    ms.variance,
    ms.earliest_measurement,
    ms.latest_measurement,
    ms.average_seconds_between_measurements,
    ms.median_seconds_between_measurements,
    COALESCE(rs1.number_of_predictor_ratings, 0) + COALESCE(rs2.number_of_outcome_ratings, 0) as total_ratings,
    COALESCE(rel1.number_of_relationships_as_cause, 0) as relationships_as_cause,
    COALESCE(rel2.number_of_relationships_as_effect, 0) as relationships_as_effect,
    NOW() as calculated_at
FROM medical_ref.global_variables gv
LEFT JOIN measurement_stats ms ON ms.variable_id = gv.id
LEFT JOIN rating_stats rs1 ON rs1.variable_id = gv.id
LEFT JOIN rating_stats rs2 ON rs2.variable_id = gv.id
LEFT JOIN relationship_stats rel1 ON rel1.variable_id = gv.id
LEFT JOIN relationship_stats rel2 ON rel2.variable_id = gv.id;

-- Create index for better performance
CREATE UNIQUE INDEX ON medical_ref.global_variable_stats (id);

-- Create refresh function
CREATE OR REPLACE FUNCTION medical_ref.refresh_global_variable_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY medical_ref.global_variable_stats;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh stats when measurements are updated
CREATE OR REPLACE FUNCTION medical_ref.trigger_refresh_global_variable_stats()
RETURNS trigger AS $$
BEGIN
    PERFORM medical_ref.refresh_global_variable_stats();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_global_variable_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON medical.variable_measurements
FOR EACH STATEMENT EXECUTE FUNCTION medical_ref.trigger_refresh_global_variable_stats();

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