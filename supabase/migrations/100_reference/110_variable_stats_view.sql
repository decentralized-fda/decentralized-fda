-- Create materialized view for variable statistics
CREATE MATERIALIZED VIEW reference.variable_stats AS
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
    FROM personal.user_measurements
    GROUP BY variable_id
),
rating_stats AS (
    SELECT 
        predictor_variable_id as variable_id,
        COUNT(*) as number_of_predictor_ratings,
        COUNT(DISTINCT user_id) as number_of_rating_users
    FROM personal.user_variable_ratings
    GROUP BY predictor_variable_id
    UNION ALL
    SELECT 
        outcome_variable_id as variable_id,
        COUNT(*) as number_of_outcome_ratings,
        COUNT(DISTINCT user_id) as number_of_rating_users
    FROM personal.user_variable_ratings
    GROUP BY outcome_variable_id
),
relationship_stats AS (
    SELECT 
        predictor_variable_id as variable_id,
        COUNT(*) as number_of_relationships_as_cause
    FROM reference.variable_relationships
    GROUP BY predictor_variable_id
    UNION ALL
    SELECT 
        outcome_variable_id as variable_id,
        COUNT(*) as number_of_relationships_as_effect
    FROM reference.variable_relationships
    GROUP BY outcome_variable_id
)
SELECT 
    v.id,
    v.name,
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
FROM reference.variables v
LEFT JOIN measurement_stats ms ON ms.variable_id = v.id
LEFT JOIN rating_stats rs1 ON rs1.variable_id = v.id
LEFT JOIN rating_stats rs2 ON rs2.variable_id = v.id
LEFT JOIN relationship_stats rel1 ON rel1.variable_id = v.id
LEFT JOIN relationship_stats rel2 ON rel2.variable_id = v.id;

-- Create index for better performance
CREATE UNIQUE INDEX ON reference.variable_stats (id);

-- Create refresh function
CREATE OR REPLACE FUNCTION reference.refresh_variable_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY reference.variable_stats;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh stats when measurements are updated
CREATE OR REPLACE FUNCTION reference.trigger_refresh_variable_stats()
RETURNS trigger AS $$
BEGIN
    PERFORM reference.refresh_variable_stats();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_variable_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON personal.user_measurements
FOR EACH STATEMENT EXECUTE FUNCTION reference.trigger_refresh_variable_stats(); 