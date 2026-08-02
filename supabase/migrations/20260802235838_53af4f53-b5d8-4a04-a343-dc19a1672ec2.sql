
-- Link a freshly signed-up influencer account to its influencer record by email
CREATE OR REPLACE FUNCTION public.claim_influencer_profile()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
  inf_id text;
BEGIN
  IF uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO inf_id FROM public.influencers WHERE user_id = uid LIMIT 1;
  IF inf_id IS NOT NULL THEN
    RETURN inf_id;
  END IF;

  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  IF uemail IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.influencers
     SET user_id = uid
   WHERE user_id IS NULL
     AND lower(email) = lower(uemail)
  RETURNING id INTO inf_id;

  RETURN inf_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_influencer_profile() TO authenticated;

-- Earnings for the signed-in influencer: campaign budget split across participating influencers
CREATE OR REPLACE FUNCTION public.influencer_earnings()
RETURNS TABLE (
  campaign_id uuid,
  campaign_name text,
  campaign_status campaign_status,
  invite_status text,
  participants integer,
  share integer,
  paid boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    c.status,
    ci.status,
    cnt.n::int,
    FLOOR(c.budget::numeric / GREATEST(cnt.n, 1))::int,
    EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.campaign_id = c.id AND p.status = 'paid'
    ),
    ci.created_at
  FROM public.campaign_influencers ci
  JOIN public.influencers i ON i.id = ci.influencer_id
  JOIN public.campaigns c ON c.id = ci.campaign_id
  JOIN LATERAL (
    SELECT count(*) AS n FROM public.campaign_influencers x WHERE x.campaign_id = c.id
  ) cnt ON true
  WHERE i.user_id = auth.uid()
    AND ci.status = 'accepted';
$$;

GRANT EXECUTE ON FUNCTION public.influencer_earnings() TO authenticated;
