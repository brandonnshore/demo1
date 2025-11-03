export const CANVAS_CONFIG = {
  CONTAINER_MAX_WIDTH: 600,
  CONTAINER_MAX_HEIGHT: 700,
  ARTWORK_MAX_WIDTH: 250,
  ARTWORK_MAX_HEIGHT: 250,
  ARTWORK_MIN_SIZE: 50,
  ARTWORK_MAX_RESIZE: 400,
  EXPORT_PIXEL_RATIO_HIGH: 3,
  EXPORT_PIXEL_RATIO_MEDIUM: 2,
  EXPORT_PIXEL_RATIO_LOW: 1,
  EXPORT_QUALITY_HIGH: 1,
  EXPORT_QUALITY_MEDIUM: 0.9,
  EXPORT_QUALITY_LOW: 0.8
} as const;

export const TSHIRT_BOUNDS = {
  FRONT: {
    minX: 103,
    maxX: 493,
    minY: 100,
    maxY: 550
  },
  BACK: {
    minX: 140,
    maxX: 510,
    minY: 100,
    maxY: 550
  },
  NECK: {
    minX: 520,
    maxX: 1080,
    minY: 560,
    maxY: 710
  }
} as const;

export const HOODIE_BOUNDS = {
  FRONT: {
    minX: 80,
    maxX: 470,
    minY: 100,
    maxY: 650
  },
  BACK: {
    minX: 120,
    maxX: 510,
    minY: 100,
    maxY: 650
  }
} as const;
