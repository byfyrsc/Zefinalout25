CREATE OR REPLACE FUNCTION public.get_location_stats(p_location_id uuid, p_period_days int DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    stats json;
    start_date date := NOW() - (p_period_days || ' days')::interval;
    mid_date date := NOW() - ((p_period_days / 2) || ' days')::interval;
    nps_first_half decimal;
    nps_second_half decimal;
    trend text;
BEGIN
    WITH relevant_feedbacks AS (
        SELECT * FROM public.feedbacks
        WHERE location_id = p_location_id AND created_at >= start_date
    )
    SELECT json_build_object(
        'total_feedbacks', COUNT(*),
        'avg_nps', AVG(nps_score),
        'avg_rating', AVG(overall_rating),
        'sentiment_distribution', (
            SELECT json_build_object(
                'positive', COUNT(*) FILTER (WHERE sentiment = 'positive'),
                'neutral', COUNT(*) FILTER (WHERE sentiment = 'neutral'),
                'negative', COUNT(*) FILTER (WHERE sentiment = 'negative')
            )
        )
    ) INTO stats
    FROM relevant_feedbacks;

    -- Calculate trend by comparing NPS of first and second half of the period
    SELECT AVG(nps_score) INTO nps_first_half
    FROM public.feedbacks
    WHERE location_id = p_location_id AND created_at >= start_date AND created_at < mid_date;

    SELECT AVG(nps_score) INTO nps_second_half
    FROM public.feedbacks
    WHERE location_id = p_location_id AND created_at >= mid_date;

    IF nps_second_half IS NULL OR nps_first_half IS NULL THEN
        trend := 'stable';
    ELSIF nps_second_half > nps_first_half THEN
        trend := 'up';
    ELSIF nps_second_half < nps_first_half THEN
        trend := 'down';
    ELSE
        trend := 'stable';
    END IF;

    -- Add trend to the stats object
    stats := stats || jsonb_build_object('trend', trend);

    RETURN stats;
END;
$$;
