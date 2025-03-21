-- Create materialized view for variable statistics
CREATE MATERIALIZED VIEW reference.variable_stats AS
WITH measurement_stats AS (
    SELECT 
        m.variable_id,
        COUNT(DISTINCT m.user_id) as number_of_users,
        COUNT(*) as number_of_measurements,
        MIN(m.value) as minimum_recorded_value,
        MAX(m.value) as maximum_recorded_value,
        AVG(m.value) as average_value,
        STDDEV(m.value) as standard_deviation,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY m.value) as percentile_25,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY m.value) as percentile_50,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.value) as percentile_75,
        MIN(m.timestamp) as earliest_measurement,
        MAX(m.timestamp) as latest_measurement
    FROM personal.measurements m
    GROUP BY m.variable_id
),
relationship_stats AS (
    SELECT 
        v.id as variable_id,
        COUNT(DISTINCT CASE WHEN r.predictor_variable_id = v.id THEN r.id END) as number_of_outcomes,
        COUNT(DISTINCT CASE WHEN r.outcome_variable_id = v.id THEN r.id END) as number_of_predictors,
        COUNT(DISTINCT CASE WHEN r.predictor_variable_id = v.id AND r.relationship_type = 'predicts' THEN r.id END) as number_of_strong_predictions,
        COUNT(DISTINCT CASE WHEN r.predictor_variable_id = v.id AND r.relationship_type = 'may_predict' THEN r.id END) as number_of_weak_predictions
    FROM reference.global_variables v
    LEFT JOIN reference.variable_relationships r ON v.id = r.predictor_variable_id OR v.id = r.outcome_variable_id
    GROUP BY v.id
)
SELECT 
    v.id,
    v.name,
    v.display_name,
    v.category_id,
    v.data_type,
    COALESCE(ms.number_of_users, 0) as number_of_users,
    COALESCE(ms.number_of_measurements, 0) as number_of_measurements,
    ms.minimum_recorded_value,
    ms.maximum_recorded_value,
    ms.average_value,
    ms.standard_deviation,
    ms.percentile_25,
    ms.percentile_50,
    ms.percentile_75,
    ms.earliest_measurement,
    ms.latest_measurement,
    COALESCE(rs.number_of_outcomes, 0) as number_of_outcomes,
    COALESCE(rs.number_of_predictors, 0) as number_of_predictors,
    COALESCE(rs.number_of_strong_predictions, 0) as number_of_strong_predictions,
    COALESCE(rs.number_of_weak_predictions, 0) as number_of_weak_predictions,
    NOW() as last_updated
FROM reference.global_variables v
LEFT JOIN measurement_stats ms ON v.id = ms.variable_id
LEFT JOIN relationship_stats rs ON v.id = rs.variable_id;

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
AFTER INSERT OR UPDATE OR DELETE ON personal.measurements
FOR EACH STATEMENT EXECUTE FUNCTION reference.trigger_refresh_variable_stats(); 