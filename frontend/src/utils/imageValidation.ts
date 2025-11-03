const DPI_THRESHOLD = 300;

export const checkImageDPI = async (
  arrayBuffer: ArrayBuffer,
  mimeType: string
): Promise<number | null> => {
  const view = new DataView(arrayBuffer);

  try {
    if (mimeType === 'image/png') {
      return readPngDPI(view);
    } else if (mimeType === 'image/jpeg') {
      return readJpegDPI(view);
    }
  } catch (error) {
    console.error('Error reading DPI:', error);
  }

  return null;
};

const readPngDPI = (view: DataView): number | null => {
  let offset = 8;

  while (offset < view.byteLength) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7)
    );

    if (type === 'pHYs') {
      const pixelsPerUnitX = view.getUint32(offset + 8);
      const unit = view.getUint8(offset + 16);

      if (unit === 1) {
        return Math.round(pixelsPerUnitX / 39.3701);
      }
    }

    offset += length + 12;
  }

  return null;
};

const readJpegDPI = (view: DataView): number | null => {
  let offset = 2;

  while (offset < view.byteLength) {
    const marker = view.getUint16(offset);

    if (marker === 0xFFE0) {
      const densityUnits = view.getUint8(offset + 11);
      const xDensity = view.getUint16(offset + 12);

      if (densityUnits === 1) {
        return xDensity;
      } else if (densityUnits === 2) {
        return Math.round(xDensity * 2.54);
      }
      break;
    }

    const segmentLength = view.getUint16(offset + 2);
    offset += segmentLength + 2;
  }

  return null;
};

export const validateImageDPI = async (
  file: File
): Promise<{ valid: boolean; dpi: number | null }> => {
  if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
    return { valid: true, dpi: null };
  }

  const arrayBuffer = await file.arrayBuffer();
  const dpi = await checkImageDPI(arrayBuffer, file.type);

  return {
    valid: !dpi || dpi >= DPI_THRESHOLD,
    dpi
  };
};

export const promptForLowDPIUpload = (dpi: number): boolean => {
  return window.confirm(
    `Warning: This image has a DPI of ${dpi}, which is below the required ${DPI_THRESHOLD} DPI for high-quality DTG printing. The print quality may be poor.\n\nDo you want to upload it anyway?`
  );
};
