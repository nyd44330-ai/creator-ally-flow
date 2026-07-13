import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyInfluencerProfile } from "./creator.functions";
import { useAuth } from "./auth";

export function useMyInfluencerProfile() {
  const { isAuthed } = useAuth();
  const fn = useServerFn(getMyInfluencerProfile);
  return useQuery({
    queryKey: ["my-influencer-profile"],
    queryFn: () => fn(),
    enabled: isAuthed,
    staleTime: 60_000,
  });
}
