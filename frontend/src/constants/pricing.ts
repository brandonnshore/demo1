export const TSHIRT_BASE_PRICE = 12.98;
export const HOODIE_BASE_PRICE = 35.99;
export const DUAL_LOCATION_UPCHARGE = 5.00;
export const NECK_LABEL_UPCHARGE = 1.00;

export const calculateUnitCost = (
  hasFrontArtwork: boolean,
  hasBackArtwork: boolean,
  hasNeckLabel: boolean,
  basePrice: number
): number => {
  let unitCost = basePrice;

  const printLocations = [hasFrontArtwork, hasBackArtwork].filter(Boolean).length;

  if (printLocations === 2) {
    unitCost += DUAL_LOCATION_UPCHARGE;
  }

  if (hasNeckLabel) {
    unitCost += NECK_LABEL_UPCHARGE;
  }

  return unitCost;
};
