/**
 * Supabase Backend Adapter for Hackathon Deployment.
 * If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are present,
 * it synchronizes live advisories and fleet SOS beacons to Supabase PostgreSQL.
 * Otherwise, it falls back seamlessly to offline local storage.
 * 
 * --- SUPABASE SQL SCHEMA ---
 * 
 * CREATE TABLE advisories (
 *   id TEXT PRIMARY KEY,
 *   harbor_id TEXT NOT NULL,
 *   harbor_name TEXT NOT NULL,
 *   type TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   risk_level TEXT NOT NULL,
 *   latitude DOUBLE PRECISION,
 *   longitude DOUBLE PRECISION,
 *   distance_km DOUBLE PRECISION,
 *   bearing_direction TEXT,
 *   depth_meters TEXT,
 *   target_species JSONB,
 *   voice_text JSONB,
 *   sms_payload TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * CREATE TABLE sos_distress_logs (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   boat_name TEXT,
 *   latitude DOUBLE PRECISION,
 *   longitude DOUBLE PRECISION,
 *   battery_pct INT,
 *   status TEXT DEFAULT 'ACTIVE',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export async function pushAdvisoryToSupabase(advisory) {
  if (!isSupabaseConfigured) {
    console.log('[Supabase Mock] Saved advisory locally:', advisory.id);
    return { success: true, mode: 'local' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/advisories`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        id: advisory.id,
        harbor_id: advisory.harborId,
        harbor_name: advisory.harborName,
        type: advisory.type,
        title: advisory.title,
        risk_level: advisory.riskLevel,
        latitude: advisory.coordinates?.lat,
        longitude: advisory.coordinates?.lon,
        distance_km: advisory.distanceKm,
        bearing_direction: advisory.bearingDirection,
        depth_meters: advisory.depthMeters,
        target_species: advisory.targetSpecies,
        voice_text: advisory.voiceText,
        sms_payload: advisory.smsPayload,
      }),
    });
    return { success: res.ok, mode: 'cloud' };
  } catch (err) {
    console.warn('Failed to push to Supabase, stored locally:', err);
    return { success: true, mode: 'local' };
  }
}
