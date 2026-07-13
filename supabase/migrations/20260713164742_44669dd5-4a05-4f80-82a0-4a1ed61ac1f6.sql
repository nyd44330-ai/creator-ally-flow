
-- Add email + user_id to influencers
ALTER TABLE public.influencers
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS influencers_email_lower_uniq ON public.influencers (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS influencers_user_id_uniq ON public.influencers (user_id) WHERE user_id IS NOT NULL;

-- Owner update policy
DROP POLICY IF EXISTS "Influencer can update own profile" ON public.influencers;
CREATE POLICY "Influencer can update own profile"
  ON public.influencers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- campaign_influencers: influencer can read + update their own invites
DROP POLICY IF EXISTS "Influencer reads own invites" ON public.campaign_influencers;
CREATE POLICY "Influencer reads own invites"
  ON public.campaign_influencers FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.influencers i WHERE i.id = campaign_influencers.influencer_id AND i.user_id = auth.uid()));

DROP POLICY IF EXISTS "Influencer updates own invites" ON public.campaign_influencers;
CREATE POLICY "Influencer updates own invites"
  ON public.campaign_influencers FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.influencers i WHERE i.id = campaign_influencers.influencer_id AND i.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.influencers i WHERE i.id = campaign_influencers.influencer_id AND i.user_id = auth.uid()));

-- campaigns: allow influencer to read campaigns they're invited to
DROP POLICY IF EXISTS "Influencer reads invited campaigns" ON public.campaigns;
CREATE POLICY "Influencer reads invited campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaign_influencers ci
    JOIN public.influencers i ON i.id = ci.influencer_id
    WHERE ci.campaign_id = campaigns.id AND i.user_id = auth.uid()
  ));

-- conversations: influencer can read + update conversations targeting them
DROP POLICY IF EXISTS "Influencer reads own conversations" ON public.conversations;
CREATE POLICY "Influencer reads own conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.influencers i WHERE i.id = conversations.influencer_id AND i.user_id = auth.uid()));

-- messages: influencer can read + insert into their own conversations
DROP POLICY IF EXISTS "Influencer reads messages in own conversations" ON public.messages;
CREATE POLICY "Influencer reads messages in own conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.influencers i ON i.id = c.influencer_id
    WHERE c.id = messages.conversation_id AND i.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Influencer sends messages in own conversations" ON public.messages;
CREATE POLICY "Influencer sends messages in own conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.influencers i ON i.id = c.influencer_id
    WHERE c.id = messages.conversation_id AND i.user_id = auth.uid()
  ));
