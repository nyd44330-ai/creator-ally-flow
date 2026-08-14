-- 1) ROLES
CREATE TYPE public.app_role AS ENUM ('advertiser', 'influencer', 'admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_own_select" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- backfill advertiser role for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'advertiser'::public.app_role FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'influencer'::public.app_role FROM public.influencers WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 2) INFLUENCERS: published flag + column-level email protection
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
UPDATE public.influencers SET published = true WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Influencer can update own profile" ON public.influencers;
DROP POLICY IF EXISTS "influencers_public_read" ON public.influencers;

CREATE POLICY "influencers_public_read" ON public.influencers
FOR SELECT TO anon, authenticated
USING (published = true OR user_id = auth.uid());

REVOKE SELECT ON public.influencers FROM anon, authenticated;
GRANT SELECT (
  id, name, category, image, rating, reviews, verified, featured,
  tiktok, instagram, youtube, tiktok_url, instagram_url, youtube_url,
  price_min, price_max, services, bio, location, languages, portfolio,
  created_at, user_id, published
) ON public.influencers TO anon, authenticated;
GRANT UPDATE (
  name, category, image, tiktok, instagram, youtube, tiktok_url,
  instagram_url, youtube_url, price_min, price_max, services, bio,
  location, languages, portfolio, published
) ON public.influencers TO authenticated;
GRANT ALL ON public.influencers TO service_role;

-- 3) CAMPAIGN_INFLUENCERS: constrained status + column guard
UPDATE public.campaign_influencers
   SET status = 'invited'
 WHERE status NOT IN ('pending_payment', 'invited', 'accepted', 'declined');

ALTER TABLE public.campaign_influencers
  ALTER COLUMN status SET DEFAULT 'pending_payment';

ALTER TABLE public.campaign_influencers
  ADD CONSTRAINT campaign_influencers_status_check
  CHECK (status IN ('pending_payment', 'invited', 'accepted', 'declined'));

CREATE OR REPLACE FUNCTION public.guard_campaign_influencer_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF private.is_campaign_owner(OLD.campaign_id, auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF NEW.campaign_id IS DISTINCT FROM OLD.campaign_id
     OR NEW.influencer_id IS DISTINCT FROM OLD.influencer_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'only status can be changed';
  END IF;

  IF OLD.status <> 'invited' OR NEW.status NOT IN ('accepted', 'declined') THEN
    RAISE EXCEPTION 'invalid status transition';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guard_ci_update
BEFORE UPDATE ON public.campaign_influencers
FOR EACH ROW EXECUTE FUNCTION public.guard_campaign_influencer_update();

-- 4) CONVERSATIONS: influencer may open a conversation for an accepted offer
CREATE POLICY "Influencer opens conversation for accepted offer" ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
      FROM public.influencers i
      JOIN public.campaign_influencers ci ON ci.influencer_id = i.id
      JOIN public.campaigns c ON c.id = ci.campaign_id
     WHERE i.user_id = auth.uid()
       AND i.id = conversations.influencer_id
       AND ci.campaign_id = conversations.campaign_id
       AND ci.status = 'accepted'
       AND c.advertiser_id = conversations.advertiser_id
  )
);

CREATE POLICY "Influencer updates own conversations" ON public.conversations
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.influencers i WHERE i.id = conversations.influencer_id AND i.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.influencers i WHERE i.id = conversations.influencer_id AND i.user_id = auth.uid()));

-- 5) remove duplicate/legacy functions
DROP FUNCTION IF EXISTS public.claim_influencer_profile();
DROP FUNCTION IF EXISTS public.link_influencer_account();
DROP FUNCTION IF EXISTS public.influencer_earnings();

-- 6) earnings restricted to accepted offers on funded campaigns
CREATE OR REPLACE FUNCTION public.my_influencer_earnings()
RETURNS TABLE(campaign_id uuid, campaign_name text, status text, invite_status text, budget integer, influencer_count integer, share numeric, start_date date, end_date date)
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
      SELECT count(*) AS n
        FROM public.campaign_influencers x
       WHERE x.campaign_id = c.id
         AND x.status = 'accepted'
    ) cnt ON true
   WHERE i.user_id = auth.uid()
     AND ci.status = 'accepted'
     AND c.status IN ('active', 'completed')
   ORDER BY c.created_at DESC;
$$;

-- 7) profile bootstrap: unpublished by default + influencer role
CREATE OR REPLACE FUNCTION public.ensure_influencer_profile()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  u record;
  inf_id text;
BEGIN
  IF uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO inf_id FROM public.influencers WHERE user_id = uid LIMIT 1;
  IF inf_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'influencer')
    ON CONFLICT DO NOTHING;
    RETURN inf_id;
  END IF;

  SELECT email, raw_user_meta_data INTO u FROM auth.users WHERE id = uid;
  IF u IS NULL THEN
    RETURN NULL;
  END IF;

  IF u.email IS NOT NULL THEN
    UPDATE public.influencers
       SET user_id = uid
     WHERE user_id IS NULL
       AND lower(email) = lower(u.email)
    RETURNING id INTO inf_id;
  END IF;

  IF inf_id IS NULL THEN
    inf_id := 'inf_' || replace(uid::text, '-', '');
    INSERT INTO public.influencers (id, user_id, name, email, category, image, published)
    VALUES (
      inf_id,
      uid,
      COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), NULLIF(u.raw_user_meta_data->>'name', ''), 'مؤثر جديد'),
      u.email,
      'عام',
      COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', ''),
      false
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'influencer')
  ON CONFLICT DO NOTHING;

  RETURN inf_id;
END;
$$;

-- 8) new users get the advertiser role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'advertiser')
  ON CONFLICT DO NOTHING;

  IF NEW.email IS NOT NULL THEN
    UPDATE public.influencers
       SET user_id = NEW.id
     WHERE user_id IS NULL
       AND lower(email) = lower(NEW.email);
  END IF;

  RETURN NEW;
END;
$$;