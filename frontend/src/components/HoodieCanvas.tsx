import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';

interface HoodieCanvasProps {
  artworks?: Array<{url: string, position: any}>;
  onArtworkPositionChange?: (data: any, index: number) => void;
  onArtworkDelete?: (index: number) => void;
  view?: 'front' | 'neck' | 'back';
}

const HoodieCanvas = forwardRef(({
  artworks = [],
  onArtworkPositionChange,
  onArtworkDelete,
  view = 'front',
}: HoodieCanvasProps, ref) => {
  const [hoodieImage, setHoodieImage] = useState<HTMLImageElement | null>(null);
  const [artworkImages, setArtworkImages] = useState<HTMLImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const imageRefs = useRef<(Konva.Image | null)[]>([]);
  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // Cache for hoodie images - ONLY hoodies, no t-shirt logic
  const cachedImages = useRef<{
    front: HTMLImageElement | null;
    back: HTMLImageElement | null;
    neck: HTMLImageElement | null;
  }>({
    front: null,
    back: null,
    neck: null,
  });

  const [hoodieDimensions, setHoodieDimensions] = useState({ width: 690, height: 805 });

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    downloadImage: () => {
      if (stageRef.current) {
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
      }
    },
    getThumbnail: () => {
      if (stageRef.current) {
        return stageRef.current.toDataURL({
          pixelRatio: 1,
          mimeType: 'image/png',
          quality: 0.8
        });
      }
      return null;
    },
    captureImage: () => {
      if (stageRef.current) {
        return stageRef.current.toDataURL({
          pixelRatio: 2,
          mimeType: 'image/png',
          quality: 0.9
        });
      }
      return null;
    },
    getThumbnailBlob: async (): Promise<Blob | null> => {
      if (stageRef.current) {
        const dataUrl = stageRef.current.toDataURL({
          pixelRatio: 1,
          mimeType: 'image/png',
          quality: 0.8
        });
        const response = await fetch(dataUrl);
        return await response.blob();
      }
      return null;
    }
  }));

  // Preload hoodie images on mount - ONLY hoodie images
  useEffect(() => {
    const preloadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
      });
    };

    const hoodiePaths = {
      front: '/assets/hoodie-black-front.png',
      back: '/assets/hoodie-black-back.png',
      neck: '/assets/hoodie-black-back.png', // Use back for neck view
    };

    Promise.all([
      preloadImage(hoodiePaths.front),
      preloadImage(hoodiePaths.back),
      preloadImage(hoodiePaths.neck),
    ]).then(([frontImg, backImg, neckImg]) => {
      cachedImages.current = {
        front: frontImg,
        back: backImg,
        neck: neckImg
      };

      const currentImg = view === 'neck' ? neckImg : view === 'back' ? backImg : frontImg;

      // Calculate dimensions for hoodie
      const aspectRatio = currentImg.width / currentImg.height;
      const containerMaxWidth = 600;
      const containerMaxHeight = 700;

      let width = containerMaxWidth;
      let height = containerMaxWidth / aspectRatio;

      if (height > containerMaxHeight) {
        height = containerMaxHeight;
        width = containerMaxHeight * aspectRatio;
      }

      // Scale up hoodie
      width = width * 1.15;
      height = height * 1.15;

      setHoodieDimensions({ width, height });
      setHoodieImage(currentImg);
    });
  }, []); // Run once on mount

  // Switch views
  useEffect(() => {
    const cache = cachedImages.current;
    const nextImg = view === 'neck' ? cache.neck : view === 'back' ? cache.back : cache.front;

    if (!nextImg) return;

    const aspectRatio = nextImg.width / nextImg.height;
    const containerMaxWidth = 600;
    const containerMaxHeight = 700;

    let width = containerMaxWidth;
    let height = containerMaxWidth / aspectRatio;

    if (height > containerMaxHeight) {
      height = containerMaxHeight;
      width = containerMaxHeight * aspectRatio;
    }

    // Scale up hoodie
    width = width * 1.15;
    height = height * 1.15;

    setHoodieDimensions({ width, height });
    setHoodieImage(nextImg);
  }, [view]);

  // Handle keyboard delete
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

  // Cache for artwork images
  const artworkImageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Load artworks
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

  const checkDeselect = (e: any) => {
    const clickedOnStage = e.target === e.target.getStage();
    const clickedOnHoodie = e.target.image === hoodieImage;

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

      {/* @ts-ignore */}
      <Stage
        ref={stageRef}
        width={hoodieDimensions.width}
        height={hoodieDimensions.height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        {/* @ts-ignore */}
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
                  x={artwork.position?.x ?? 200 + index * 20}
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
                      minX: 80,
                      maxX: 470,
                      minY: 100,
                      maxY: 650
                    };

                    const node = imageRefs.current[index];
                    const imageWidth = node?.width() || 0;
                    const imageHeight = node?.height() || 0;
                    const scaleX = node?.scaleX() || 1;
                    const scaleY = node?.scaleY() || 1;

                    const scaledWidth = imageWidth * scaleX;
                    const scaledHeight = imageHeight * scaleY;

                    let newX = pos.x;
                    let newY = pos.y;

                    if (newX < shirtBounds.minX) newX = shirtBounds.minX;
                    if (newX + scaledWidth > shirtBounds.maxX) newX = shirtBounds.maxX - scaledWidth;
                    if (newY < shirtBounds.minY) newY = shirtBounds.minY;
                    if (newY + scaledHeight > shirtBounds.maxY) newY = shirtBounds.maxY - scaledHeight;

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
