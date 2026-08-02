CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_campaign_owner(_campaign_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.campaigns c
    WHERE c.id = _campaign_id
      AND c.advertiser_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION private.is_campaign_invited_influencer(_campaign_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.campaign_influencers ci
    JOIN public.influencers i ON i.id = ci.influencer_id
    WHERE ci.campaign_id = _campaign_id
      AND i.user_id = _user_id
  );
$$;

REVOKE ALL ON FUNCTION private.is_campaign_owner(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_campaign_invited_influencer(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_campaign_owner(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_campaign_invited_influencer(uuid, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Influencer reads invited campaigns" ON public.campaigns;
CREATE POLICY "Influencer reads invited campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (private.is_campaign_invited_influencer(id, auth.uid()));

DROP POLICY IF EXISTS "ci_own_all" ON public.campaign_influencers;
CREATE POLICY "ci_own_all"
ON public.campaign_influencers
FOR ALL
TO authenticated
USING (private.is_campaign_owner(campaign_id, auth.uid()))
WITH CHECK (private.is_campaign_owner(campaign_id, auth.uid()));

DROP FUNCTION IF EXISTS public.is_campaign_owner(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_campaign_invited_influencer(uuid, uuid);