-- Link the signed-in user to their influencer record by email
CREATE OR REPLACE FUNCTION public.link_influencer_account()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_id text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_id FROM public.influencers WHERE user_id = auth.uid() LIMIT 1;
  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.influencers
     SET user_id = auth.uid()
   WHERE lower(email) = lower(v_email)
     AND user_id IS NULL
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_influencer_account() TO authenticated;

-- Earnings for the signed-in influencer: campaign budget / number of influencers in campaign
CREATE OR REPLACE FUNCTION public.my_influencer_earnings()
RETURNS TABLE (
  campaign_id uuid,
  campaign_name text,
  status text,
  invite_status text,
  budget integer,
  influencer_count integer,
  share numeric,
  start_date date,
  end_date date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id,
         c.name,
         c.status::text,
         ci.status,
         c.budget,
         cnt.n::integer,
         ROUND(c.budget::numeric / GREATEST(cnt.n, 1), 2),
         c.start_date,
         c.end_date
    FROM public.campaign_influencers ci
    JOIN public.influencers i ON i.id = ci.influencer_id
    JOIN public.campaigns c ON c.id = ci.campaign_id
    JOIN LATERAL (
      SELECT count(*) AS n FROM public.campaign_influencers x WHERE x.campaign_id = c.id
    ) cnt ON true
   WHERE i.user_id = auth.uid()
   ORDER BY c.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.my_influencer_earnings() TO authenticated;