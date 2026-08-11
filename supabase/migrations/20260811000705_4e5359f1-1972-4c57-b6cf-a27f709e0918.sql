ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS user_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'influencers_user_id_fkey' AND conrelid = 'public.influencers'::regclass
  ) THEN
    ALTER TABLE public.influencers
      ADD CONSTRAINT influencers_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'influencers_user_id_key' AND conrelid = 'public.influencers'::regclass
  ) THEN
    ALTER TABLE public.influencers
      ADD CONSTRAINT influencers_user_id_key UNIQUE (user_id);
  END IF;
END $$;

DROP POLICY IF EXISTS "influencers_own_update" ON public.influencers;
CREATE POLICY "influencers_own_update" ON public.influencers
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  IF NEW.email IS NOT NULL THEN
    UPDATE public.influencers
       SET user_id = NEW.id
     WHERE user_id IS NULL
       AND lower(email) = lower(NEW.email);
  END IF;

  RETURN NEW;
END;
$function$;