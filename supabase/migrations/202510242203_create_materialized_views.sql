-- DAILY_FEEDBACK_SUMMARY
CREATE MATERIALIZED VIEW daily_feedback_summary AS
SELECT 
  l.tenant_id,
  f.location_id,
  DATE(f.created_at) as feedback_date,
  COUNT(*) as total_feedbacks,
  AVG(f.nps_score) as avg_nps,
  AVG(f.overall_rating) as avg_rating,
  COUNT(*) FILTER (WHERE f.sentiment = 'positive') as positive_count,
  COUNT(*) FILTER (WHERE f.sentiment = 'neutral') as neutral_count,
  COUNT(*) FILTER (WHERE f.sentiment = 'negative') as negative_count,
  COUNT(*) FILTER (WHERE f.nps_score >= 9) as promoters,
  COUNT(*) FILTER (WHERE f.nps_score >= 7 AND f.nps_score <= 8) as passives,
  COUNT(*) FILTER (WHERE f.nps_score <= 6) as detractors
FROM feedbacks f
JOIN locations l ON f.location_id = l.id
WHERE f.deleted_at IS NULL
GROUP BY l.tenant_id, f.location_id, DATE(f.created_at);

CREATE UNIQUE INDEX idx_daily_summary_unique 
  ON daily_feedback_summary(tenant_id, location_id, feedback_date);

-- TENANT_STATISTICS
CREATE MATERIALIZED VIEW tenant_statistics AS
SELECT 
  t.id as tenant_id,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT l.id) as total_locations,
  COUNT(DISTINCT f.id) as total_feedbacks,
  COUNT(DISTINCT f.id) FILTER (
    WHERE f.created_at >= DATE_TRUNC('month', CURRENT_DATE)
  ) as feedbacks_this_month,
  AVG(f.nps_score) as avg_nps_score,
  AVG(f.overall_rating) as avg_overall_rating
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id AND u.deleted_at IS NULL
LEFT JOIN locations l ON t.id = l.tenant_id AND l.deleted_at IS NULL
LEFT JOIN feedbacks f ON l.id = f.location_id
WHERE t.deleted_at IS NULL
GROUP BY t.id;

CREATE UNIQUE INDEX idx_tenant_stats_unique ON tenant_statistics(tenant_id);