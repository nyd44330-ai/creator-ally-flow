REVOKE ALL ON FUNCTION public.guard_campaign_influencer_update() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.ensure_influencer_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_influencer_profile() TO authenticated;

REVOKE ALL ON FUNCTION public.my_influencer_earnings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_influencer_earnings() TO authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;