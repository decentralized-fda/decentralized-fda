-- View for aggregating variable relationship ratings
CREATE MATERIALIZED VIEW reference.aggregated_variable_ratings AS
WITH relationship_stats AS (
    SELECT 
        r.predictor_variable_id,
        r.outcome_variable_id,
        COUNT(DISTINCT r.user_id) as number_of_users,
        AVG(r.correlation_coefficient) as average_correlation,
        AVG(r.confidence_score) as average_confidence,
        SUM(CASE WHEN r.user_vote = 1 THEN 1 ELSE 0 END) as positive_votes,
        SUM(CASE WHEN r.user_vote = -1 THEN 1 ELSE 0 END) as negative_votes,
        SUM(CASE WHEN r.user_vote = 0 THEN 1 ELSE 0 END) as neutral_votes
    FROM personal.user_variable_relationships r
    GROUP BY r.predictor_variable_id, r.outcome_variable_id
)
SELECT 
    rs.*,
    p.name as predictor_name,
    p.display_name as predictor_display_name,
    o.name as outcome_name,
    o.display_name as outcome_display_name,
    (rs.positive_votes - rs.negative_votes)::float / NULLIF(rs.positive_votes + rs.negative_votes, 0) as vote_ratio,
    NOW() as last_updated
FROM relationship_stats rs
JOIN reference.global_variables p ON rs.predictor_variable_id = p.id
JOIN reference.global_variables o ON rs.outcome_variable_id = o.id;

-- Create unique index for the materialized view
CREATE UNIQUE INDEX idx_aggregated_ratings_variables 
ON reference.aggregated_variable_ratings(predictor_variable_id, outcome_variable_id); 