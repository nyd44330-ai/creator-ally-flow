-- Create custom type for campaign status
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');

-- Create campaign_influencers table
CREATE TABLE IF NOT EXISTS public.campaign_influencers (
    campaign_id uuid NOT NULL,
    influencer_id text NOT NULL,
    status text DEFAULT 'invited'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (campaign_id, influencer_id)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    advertiser_id uuid NOT NULL,
    name text NOT NULL,
    goal text,
    budget integer DEFAULT 0 NOT NULL,
    spent integer DEFAULT 0 NOT NULL,
    status campaign_status DEFAULT 'draft' NOT NULL,
    start_date date,
    end_date date,
    platforms text[] DEFAULT '{}'::text[] NOT NULL,
    content_type text,
    deliverables text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    advertiser_id uuid NOT NULL,
    influencer_id text NOT NULL,
    campaign_id uuid,
    last_message text,
    last_message_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id uuid NOT NULL,
    influencer_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, influencer_id)
);

-- Create influencers table
CREATE TABLE IF NOT EXISTS public.influencers (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    image text NOT NULL,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    reviews integer DEFAULT 0 NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    tiktok text,
    instagram text,
    youtube text,
    tiktok_url text,
    instagram_url text,
    youtube_url text,
    price_min integer DEFAULT 0 NOT NULL,
    price_max integer DEFAULT 0 NOT NULL,
    services jsonb DEFAULT '[]'::jsonb NOT NULL,
    bio text,
    location text,
    languages jsonb DEFAULT '[]'::jsonb NOT NULL,
    portfolio jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text,
    user_id uuid
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    conversation_id uuid NOT NULL,
    sender text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT messages_sender_check CHECK (sender IN ('advertiser', 'influencer', 'system'))
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    campaign_id uuid NOT NULL,
    advertiser_id uuid NOT NULL,
    amount integer NOT NULL,
    fee integer DEFAULT 0 NOT NULL,
    tax integer DEFAULT 0 NOT NULL,
    total integer NOT NULL,
    method text NOT NULL,
    provider text DEFAULT 'chargily' NOT NULL,
    provider_ref text,
    checkout_url text,
    status text DEFAULT 'pending' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY NOT NULL,
    full_name text,
    company_name text,
    industry text,
    website text,
    description text,
    phone text,
    email text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser_id ON public.campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_conversations_advertiser_id ON public.conversations(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_conversations_influencer_id ON public.conversations(influencer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_campaign_id ON public.conversations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_payments_campaign_id ON public.payments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payments_advertiser_id ON public.payments(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_influencers_category ON public.influencers(category);
