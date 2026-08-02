
REVOKE ALL ON FUNCTION public.claim_influencer_profile() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.influencer_earnings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_influencer_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.influencer_earnings() TO authenticated;
