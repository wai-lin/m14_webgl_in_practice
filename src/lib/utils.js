export function rangeTimedScale(ocillatedTime, min, max) {
  const normalizedScale = (ocillatedTime + 1) * 0.5;
  return normalizedScale * (max - min) + min;
}
