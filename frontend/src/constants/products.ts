export const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
export const MAX_ARTWORKS_PER_VIEW = 4;
export const MAX_NECK_ARTWORKS = 1;

export const HOODIE_PRODUCT_ID = '9f9e4e98-4128-4d09-af21-58e5523eed14';

export const HOODIE_VARIANT_IDS: Record<string, string> = {
  'S': '242180eb-3029-40bc-b185-7ae8e3328b31',
  'M': '677f0bf4-98b9-4088-9151-7422312bbf76',
  'L': 'd6495a9b-0e81-40f7-81e4-3cf09eb25f2a',
  'XL': 'be75094a-c54b-4e3e-b861-b57aaaf2c774',
  '2XL': '0e302d1c-ce97-4a69-96df-eb603fca599e'
};

export type Size = typeof SIZES[number];
