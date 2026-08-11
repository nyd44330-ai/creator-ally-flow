CREATE OR REPLACE FUNCTION public.ensure_influencer_profile()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

    IF inf_id IS NOT NULL THEN
      RETURN inf_id;
    END IF;
  END IF;

  inf_id := 'inf_' || replace(uid::text, '-', '');

  INSERT INTO public.influencers (id, user_id, name, email, category, image)
  VALUES (
    inf_id,
    uid,
    COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), NULLIF(u.raw_user_meta_data->>'name', ''), 'مؤثر جديد'),
    u.email,
    'عام',
    COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN inf_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_influencer_profile() TO authenticated;