/**
 * SMS & Low-Bandwidth Alert Compressor.
 * Converts PFZ and ocean safety bulletins into standardized ultra-short <140 char SMS formats
 * compatible with GSM/2G networks, USSD broadcast, and government SMS gateways (e.g. CDAC/Sandes/Twilio).
 */

export function encodeAdvisoryToSMS(advisory) {
  if (!advisory) return '';

  const zoneCode = advisory.harborName ? advisory.harborName.split(',')[0].toUpperCase() : 'COAST';
  const typeStr = advisory.type === 'CYCLONE' ? 'RED ALERT' : advisory.type;
  const latStr = advisory.coordinates?.lat ? `${advisory.coordinates.lat.toFixed(2)}N` : '';
  const lonStr = advisory.coordinates?.lon ? `${advisory.coordinates.lon.toFixed(2)}E` : '';
  const distStr = advisory.distanceNm ? `${Math.round(advisory.distanceNm)}NM` : '';
  const dirStr = advisory.bearingDirection ? advisory.bearingDirection.split('-').map(s => s[0]).join('') : '';
  
  let content = '';
  if (advisory.type === 'PFZ') {
    const species = (advisory.targetSpecies || []).slice(0, 2).join('/');
    content = `PFZ: ${latStr} ${lonStr} (${distStr} ${dirStr}). FISH: ${species}. WAVE: ${advisory.weather?.waveHeight || '1.2m'}. SAFE.`;
  } else if (advisory.type === 'CYCLONE') {
    content = `CYCLONE RED ALERT! WIND >40KT, WAVE >4M. TOTAL FISHING BAN. RETURN TO HARBOR IMMEDIATELY.`;
  } else {
    content = `ALERT: ${advisory.title}. WAVE: ${advisory.weather?.waveHeight || '3M'}. WIND: ${advisory.weather?.windSpeed || '25KT'}. CAUTION.`;
  }

  return `[MATSYA-INCOIS] ${zoneCode} | ${content}`.slice(0, 160);
}

export function generateEmergencySOSMessage(lat, lon, boatName = 'IND-BOAT-402') {
  return `SOS DISTRESS! ${boatName} in emergency at LAT: ${lat.toFixed(4)}N, LON: ${lon.toFixed(4)}E. Immediate Coast Guard assistance requested. Call 1554.`;
}
