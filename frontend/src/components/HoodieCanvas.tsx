import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

interface ArtworkPosition {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

interface Artwork {
  url: string;
  position: ArtworkPosition | null;
  assetId?: string;
}

interface HoodieCanvasProps {
  artworks?: Artwork[];
  onArtworkPositionChange?: (data: ArtworkPosition, index: number) => void;
  onArtworkDelete?: (index: number) => void;
  view?: 'front' | 'neck' | 'back';
}

interface ImageCache {
  front: HTMLImageElement | null;
  back: HTMLImageElement | null;
  neck: HTMLImageElement | null;
}

interface CanvasDimensions {
  width: number;
  height: number;
}

const HOODIE_IMAGES = {
  front: '/assets/hoodie-black-front.png',
  back: '/assets/hoodie-black-back.png',
  neck: '/assets/hoodie-black-back.png',
};

const CONTAINER_MAX_WIDTH = 600;
const CONTAINER_MAX_HEIGHT = 700;
const SCALE_FACTOR = 1.15;

const HoodieCanvas = forwardRef<unknown, HoodieCanvasProps>(({
  artworks = [],
  onArtworkPositionChange,
  onArtworkDelete,
  view = 'front',
}, ref) => {
  const [hoodieImage, setHoodieImage] = useState<HTMLImageElement | null>(null);
  const [artworkImages, setArtworkImages] = useState<HTMLImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const imageRefs = useRef<(Konva.Image | null)[]>([]);
  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const cachedImages = useRef<ImageCache>({
    front: null,
    back: null,
    neck: null,
  });
  const artworkImageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const [hoodieDimensions, setHoodieDimensions] = useState<CanvasDimensions>({ width: 690, height: 805 });

  useImperativeHandle(ref, () => ({
    downloadImage: () => {
      if (!stageRef.current) return;
      const uri = stageRef.current.toDataURL({
        pixelRatio: 3,
        mimeType: 'image/png',
        quality: 1
      });
      const link = document.createElement('a');
      link.download = 'hoodie-design.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    captureImage: () => {
      if (!stageRef.current) return null;
      return stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png',
        quality: 0.9
      });
    },
    getThumbnailBlob: async (): Promise<Blob | null> => {
      if (!stageRef.current) return null;
      const dataUrl = stageRef.current.toDataURL({
        pixelRatio: 1,
        mimeType: 'image/png',
        quality: 0.8
      });
      const response = await fetch(dataUrl);
      return await response.blob();
    }
  }));

  const preloadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = src;
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
    });
  };

  const calculateDimensions = (image: HTMLImageElement): CanvasDimensions => {
    const aspectRatio = image.width / image.height;
    let width = CONTAINER_MAX_WIDTH;
    let height = CONTAINER_MAX_WIDTH / aspectRatio;

    if (height > CONTAINER_MAX_HEIGHT) {
      height = CONTAINER_MAX_HEIGHT;
      width = CONTAINER_MAX_HEIGHT * aspectRatio;
    }

    width *= SCALE_FACTOR;
    height *= SCALE_FACTOR;

    return { width, height };
  };

  useEffect(() => {
    Promise.all([
      preloadImage(HOODIE_IMAGES.front),
      preloadImage(HOODIE_IMAGES.back),
      preloadImage(HOODIE_IMAGES.neck),
    ]).then(([frontImg, backImg, neckImg]) => {
      cachedImages.current = { front: frontImg, back: backImg, neck: neckImg };

      const currentImg = view === 'neck' ? neckImg : view === 'back' ? backImg : frontImg;
      setHoodieDimensions(calculateDimensions(currentImg));
      setHoodieImage(currentImg);
    });
  }, []);

  useEffect(() => {
    const cache = cachedImages.current;
    const nextImg = view === 'neck' ? cache.neck : view === 'back' ? cache.back : cache.front;

    if (!nextImg) return;

    setHoodieDimensions(calculateDimensions(nextImg));
    setHoodieImage(nextImg);
  }, [view]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && onArtworkDelete) {
        const index = parseInt(selectedId.split('-')[1]);
        if (!isNaN(index)) {
          onArtworkDelete(index);
          setSelectedId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, onArtworkDelete]);

  useEffect(() => {
    if (artworks.length === 0) {
      setArtworkImages([]);
      setSelectedId(null);
      imageRefs.current = [];
      return;
    }

    const loadArtworks = async () => {
      const promises = artworks.map((artwork) => {
        const cached = artworkImageCache.current.get(artwork.url);
        if (cached) return Promise.resolve(cached);

        return new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new window.Image();
          image.src = artwork.url;
          image.crossOrigin = 'anonymous';
          image.onload = () => {
            artworkImageCache.current.set(artwork.url, image);
            resolve(image);
          };
          image.onerror = reject;
        });
      });

      try {
        const loadedImages = await Promise.all(promises);
        setArtworkImages(loadedImages);
        imageRefs.current = new Array(loadedImages.length).fill(null);

        const lastArtwork = artworks[artworks.length - 1];
        if (lastArtwork && !lastArtwork.position) {
          setSelectedId(`artwork-${artworks.length - 1}`);
        }
      } catch (err) {
        console.error('Failed to load artworks:', err);
      }
    };

    loadArtworks();
  }, [artworks]);

  // Update transformer when selection changes
  useEffect(() => {
    if (selectedId && trRef.current) {
      const index = parseInt(selectedId.split('-')[1]);
      const node = imageRefs.current[index];
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedId]);

  const handleTransformEnd = (index: number) => {
    const node = imageRefs.current[index];
    if (node && onArtworkPositionChange) {
      onArtworkPositionChange({
        x: node.x(),
        y: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        rotation: node.rotation(),
      }, index);
    }
  };

  const checkDeselect = (e: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>) => {
    const clickedOnStage = e.target === e.target.getStage();
    const clickedOnHoodie = e.target instanceof Konva.Image && e.target.image() === hoodieImage;

    if (clickedOnStage || clickedOnHoodie) {
      setSelectedId(null);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {artworkImages.length > 0 && selectedId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-4 py-2 rounded-full z-10">
          Drag to move • Corners to resize • Rotate to spin • Click away to finish
        </div>
      )}

      {artworkImages.length > 0 && !selectedId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-gray-800/60 text-white text-xs px-4 py-2 rounded-full z-10">
          Click artwork to edit position and size
        </div>
      )}

      {/* @ts-expect-error React-Konva types don't properly support children */}
      <Stage
        ref={stageRef}
        width={hoodieDimensions.width}
        height={hoodieDimensions.height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        {/* @ts-expect-error React-Konva types don't properly support children */}
        <Layer>
          {hoodieImage && (
            <KonvaImage
              image={hoodieImage}
              x={0}
              y={view === 'back' ? -20 : 0}
              width={hoodieDimensions.width}
              height={hoodieDimensions.height}
              onClick={() => setSelectedId(null)}
              onTap={() => setSelectedId(null)}
            />
          )}

          {artworkImages.map((artworkImg, index) => {
            const artwork = artworks[index];
            if (!artwork) return null;

            const maxWidth = 250;
            const maxHeight = 250;
            const aspectRatio = artworkImg.width / artworkImg.height;

            let width = maxWidth;
            let height = maxWidth / aspectRatio;

            if (height > maxHeight) {
              height = maxHeight;
              width = maxHeight * aspectRatio;
            }

            return (
              <React.Fragment key={`artwork-${index}`}>
                <KonvaImage
                  ref={(el) => { imageRefs.current[index] = el; }}
                  image={artworkImg}
                  x={artwork.position?.x ?? 270 + index * 20}
                  y={artwork.position?.y ?? 250 + index * 20}
                  width={width}
                  height={height}
                  scaleX={artwork.position?.scaleX ?? 1}
                  scaleY={artwork.position?.scaleY ?? 1}
                  rotation={artwork.position?.rotation ?? 0}
                  draggable
                  dragBoundFunc={(pos) => {
                    // Different bounds for back view (shifted right)
                    const shirtBounds = view === 'back' ? {
                      minX: 120,
                      maxX: 510,
                      minY: 100,
                      maxY: 650
                    } : {
                      minX: 150,
                      maxX: 540,
                      minY: 100,
                      maxY: 650
                    };

                    // Get the actual bounding box of the image (includes rotation)
                    const node = imageRefs.current[index];
                    if (!node) return pos;

                    const box = node.getClientRect();
                    const boxWidth = box.width;
                    const boxHeight = box.height;

                    // Constrain position to keep artwork within bounds
                    let newX = pos.x;
                    let newY = pos.y;

                    // Calculate the offset from the node position to the bounding box
                    const offsetX = box.x - node.x();
                    const offsetY = box.y - node.y();

                    // Prevent artwork from going beyond edges
                    if (newX + offsetX < shirtBounds.minX) {
                      newX = shirtBounds.minX - offsetX;
                    }
                    if (newX + offsetX + boxWidth > shirtBounds.maxX) {
                      newX = shirtBounds.maxX - boxWidth - offsetX;
                    }
                    if (newY + offsetY < shirtBounds.minY) {
                      newY = shirtBounds.minY - offsetY;
                    }
                    if (newY + offsetY + boxHeight > shirtBounds.maxY) {
                      newY = shirtBounds.maxY - boxHeight - offsetY;
                    }

                    return { x: newX, y: newY };
                  }}
                  onClick={() => setSelectedId(`artwork-${index}`)}
                  onTap={() => setSelectedId(`artwork-${index}`)}
                  onDragEnd={() => handleTransformEnd(index)}
                  onTransformEnd={() => handleTransformEnd(index)}
                />
                {selectedId === `artwork-${index}` && (
                  <Transformer
                    ref={trRef}
                    keepRatio={true}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 50 || newBox.height < 50) return oldBox;
                      if (newBox.width > 400 || newBox.height > 400) return oldBox;
                      return newBox;
                    }}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    rotateEnabled={true}
                    borderStroke="#000000"
                    borderStrokeWidth={2}
                    anchorSize={12}
                    anchorStroke="#000000"
                    anchorFill="#ffffff"
                    anchorCornerRadius={6}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
});

HoodieCanvas.displayName = 'HoodieCanvas';

export default HoodieCanvas;
