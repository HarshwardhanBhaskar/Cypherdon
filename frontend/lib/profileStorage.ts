export interface CachedProfile {
  id?: string;
  email?: string;
  full_name?: string;
  phone?: string | null;
  skills?: string[];
  experience_level?: string;
  resume_url?: string | null;
  hero_image_url?: string | null;
  bio?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  languages_known?: string[];
  preferred_role?: string | null;
  preferred_location?: string | null;
  job_type?: string | null;
  salary_expectation?: string | null;
  portfolio_email?: string | null;
  portfolio_resume_url?: string | null;
  education?: any[];
  work_experience?: any[];
  projects?: any[];
  tier?: string;
}

const PROFILE_KEY = "cypherdon_profile";

export function readCachedProfile(): CachedProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as CachedProfile) : null;
  } catch {
    return null;
  }
}

export function writeCachedProfile(profile: CachedProfile) {
  if (typeof window === "undefined") return;

  const previous = readCachedProfile() || {};
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...previous, ...profile }));
}

export function clearCachedProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
}
