CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_restaurants_timestamp
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

CREATE MATERIALIZED VIEW public.daily_feedback_summary
AS
SELECT
    date_trunc('day', created_at) AS day,
    restaurant_id,
    AVG(rating) AS average_rating,
    COUNT(*) AS total_feedback
FROM
    public.feedback
GROUP BY
    1, 2
WITH DATA;

CREATE OR REPLACE FUNCTION public.refresh_daily_feedback_summary()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.daily_feedback_summary;
    RETURN NULL;
END;
$$;

CREATE TRIGGER refresh_feedback_summary
AFTER INSERT OR UPDATE OR DELETE ON public.feedback
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_daily_feedback_summary();

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS VOID LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < now() - INTERVAL '30 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_campaign_metrics()
RETURNS VOID LANGUAGE plpgsql
AS $$
BEGIN
    -- Placeholder for campaign metrics update logic
    -- This function would typically aggregate data related to campaign performance
    -- and update relevant tables.
    RAISE NOTICE 'Executing campaign metrics update...';
END;
$$;