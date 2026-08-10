REVOKE ALL ON FUNCTION public.link_influencer_account() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_influencer_earnings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_influencer_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_influencer_earnings() TO authenticated;