-- User Variable Relationships
CREATE TABLE medical.user_variable_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    cause_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    effect_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    onset_delay interval NOT NULL DEFAULT '0'::interval,
    duration_of_action interval NOT NULL DEFAULT '1 day'::interval,
    relationship varchar(8) CHECK (relationship IN ('POSITIVE', 'NEGATIVE', 'NONE')),
    confidence_level varchar(6) CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
    strength_level varchar(11) CHECK (strength_level IN ('VERY STRONG', 'STRONG', 'MODERATE', 'WEAK', 'VERY WEAK')),
    is_public boolean DEFAULT false,
    plausibly_causal boolean,
    predictor_is_controllable boolean,
    outcome_is_goal boolean,
    usefulness_vote integer CHECK (usefulness_vote BETWEEN -1 AND 1),
    causality_vote integer CHECK (causality_vote BETWEEN -1 AND 1),
    deleted_at timestamp,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cause_variable_id, effect_variable_id)
);

-- Create materialized view for variable relationship statistics
CREATE MATERIALIZED VIEW medical.user_variable_relationship_stats AS
WITH measurement_stats AS (
    SELECT 
        r.id as relationship_id,
        r.cause_variable_id,
        r.effect_variable_id,
        COUNT(DISTINCT m.id) as number_of_pairs,
        COUNT(DISTINCT DATE(m.measurement_time)) as number_of_days,
        AVG(CASE WHEN m.value > avg_m.avg_value THEN m.value END) as average_high_cause,
        AVG(CASE WHEN m.value < avg_m.avg_value THEN m.value END) as average_low_cause,
        AVG(m.value) as average_effect,
        STDDEV(m.value) as effect_baseline_standard_deviation,
        MIN(m.measurement_time) as earliest_measurement_start_at,
        MAX(m.measurement_time) as latest_measurement_start_at
    FROM medical.user_variable_relationships r
    JOIN medical.variable_measurements m ON m.variable_id = r.effect_variable_id
    CROSS JOIN (
        SELECT variable_id, AVG(value) as avg_value 
        FROM medical.variable_measurements 
        GROUP BY variable_id
    ) avg_m ON avg_m.variable_id = m.variable_id
    GROUP BY r.id, r.cause_variable_id, r.effect_variable_id
),
correlation_calcs AS (
    SELECT 
        ms.*,
        corr(c.value, e.value) as forward_pearson_correlation_coefficient,
        corr(e.value, c_prev.value) as reverse_pearson_correlation_coefficient,
        CASE 
            WHEN ABS(corr(c.value, e.value)) * SQRT(COUNT(*) - 2) / 
                SQRT(1 - POWER(corr(c.value, e.value), 2)) > 1.96 
            THEN true 
            ELSE false 
        END as is_statistically_significant
    FROM measurement_stats ms
    JOIN medical.variable_measurements c ON c.variable_id = ms.cause_variable_id
    JOIN medical.variable_measurements e ON e.variable_id = ms.effect_variable_id 
        AND e.measurement_time > c.measurement_time 
        AND e.measurement_time <= c.measurement_time + INTERVAL '1 day'
    LEFT JOIN medical.variable_measurements c_prev ON c_prev.variable_id = ms.cause_variable_id
        AND c_prev.measurement_time < e.measurement_time
    GROUP BY ms.relationship_id, ms.cause_variable_id, ms.effect_variable_id,
             ms.number_of_pairs, ms.number_of_days, ms.average_high_cause,
             ms.average_low_cause, ms.average_effect, ms.effect_baseline_standard_deviation,
             ms.earliest_measurement_start_at, ms.latest_measurement_start_at
)
SELECT 
    cc.*,
    CASE
        WHEN ABS(forward_pearson_correlation_coefficient) > 0.6 THEN 'VERY STRONG'
        WHEN ABS(forward_pearson_correlation_coefficient) > 0.4 THEN 'STRONG'
        WHEN ABS(forward_pearson_correlation_coefficient) > 0.2 THEN 'MODERATE'
        WHEN ABS(forward_pearson_correlation_coefficient) > 0.1 THEN 'WEAK'
        ELSE 'VERY WEAK'
    END as calculated_strength_level,
    CASE
        WHEN number_of_pairs > 100 AND is_statistically_significant THEN 'HIGH'
        WHEN number_of_pairs > 30 AND is_statistically_significant THEN 'MEDIUM'
        ELSE 'LOW'
    END as calculated_confidence_level,
    CASE
        WHEN forward_pearson_correlation_coefficient > 0 THEN 'POSITIVE'
        WHEN forward_pearson_correlation_coefficient < 0 THEN 'NEGATIVE'
        ELSE 'NONE'
    END as calculated_relationship
FROM correlation_calcs cc;

-- Create index for better performance
CREATE INDEX ON medical.user_variable_relationship_stats (relationship_id);

-- Create refresh function
CREATE OR REPLACE FUNCTION medical.refresh_relationship_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY medical.user_variable_relationship_stats;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh stats when measurements are updated
CREATE OR REPLACE FUNCTION medical.trigger_refresh_relationship_stats()
RETURNS trigger AS $$
BEGIN
    PERFORM medical.refresh_relationship_stats();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_relationship_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON medical.variable_measurements
FOR EACH STATEMENT EXECUTE FUNCTION medical.trigger_refresh_relationship_stats(); 