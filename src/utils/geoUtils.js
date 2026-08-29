/**
 * Geographical & Nautical Calculation Utilities for Marine Navigation
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}

/**
 * Converts kilometers to Nautical Miles (1 NM = 1.852 km)
 */
export function kmToNauticalMiles(km) {
  return Math.round((km / 1.852) * 10) / 10;
}

/**
 * Calculates compass bearing from origin to target in degrees (0-360) and cardinal direction.
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  const compassDeg = (bearing + 360) % 360;

  const cardinals = [
    'North',
    'North-East',
    'East',
    'South-East',
    'South',
    'South-West',
    'West',
    'North-West',
    'North',
  ];
  const index = Math.round(compassDeg / 45);
  return {
    deg: Math.round(compassDeg),
    direction: cardinals[index],
  };
}

/**
 * Formats lat/lon decimal into standard GPS Marine notation (e.g. 17°27'07" N, 83°40'55" E)
 */
export function formatGPSCoords(lat, lon) {
  const formatSingle = (val, posChar, negChar) => {
    const dir = val >= 0 ? posChar : negChar;
    const absVal = Math.abs(val);
    const deg = Math.floor(absVal);
    const minFloat = (absVal - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = Math.round((minFloat - min) * 60);
    return `${deg}°${min}'${sec}" ${dir}`;
  };

  return {
    latStr: formatSingle(lat, 'N', 'S'),
    lonStr: formatSingle(lon, 'E', 'W'),
    combined: `${formatSingle(lat, 'N', 'S')}, ${formatSingle(lon, 'E', 'W')}`,
  };
}
