import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';

interface TShirtCanvasProps {
  tshirtColor?: string;
  uploadedArtwork?: string | null;
  artworkPosition?: any;
  artworks?: Array<{url: string, position: any}>;
  onArtworkPositionChange?: (data: any, index: number) => void;
  view?: 'front' | 'neck' | 'back';
}

const TShirtCanvas = forwardRef(({
  tshirtColor = 'white',
  artworks = [],
  onArtworkPositionChange,
  view = 'front'
}: TShirtCanvasProps, ref) => {
  const [tshirtImage, setTshirtImage] = useState<HTMLImageElement | null>(null);
  const [artworkImages, setArtworkImages] = useState<HTMLImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const imageRefs = useRef<(Konva.Image | null)[]>([]);
  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // Load t-shirt image and calculate proper dimensions
  const [tshirtDimensions, setTshirtDimensions] = useState({ width: 550, height: 650 });

  // Expose download function to parent component
  useImperativeHandle(ref, () => ({
    downloadImage: () => {
      if (stageRef.current) {
        // Export at higher resolution for better quality
        const uri = stageRef.current.toDataURL({
          pixelRatio: 3, // 3x resolution for high quality
          mimeType: 'image/png',
          quality: 1 // Maximum quality
        });
        const link = document.createElement('a');
        link.download = 'tshirt-design.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }));

  // Load t-shirt image based on current view
  useEffect(() => {
    const loadImage = () => {
      const img = new window.Image();

      // Set image source based on view
      if (view === 'neck') {
        img.src = '/assets/neck-tshirt.jpeg';
      } else {
        img.src = '/assets/blank-tshirt.png';
      }

      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Calculate dimensions based on view
        if (view === 'neck') {
          const aspectRatio = img.width / img.height;
          const containerWidth = 1600;
          const containerHeight = 950;

          let width = containerWidth;
          let height = width / aspectRatio;

          if (height < containerHeight) {
            height = containerHeight;
            width = height * aspectRatio;
          }

          setTshirtDimensions({ width, height });
        } else {
          const containerMaxWidth = 600;
          const containerMaxHeight = 700;
          const aspectRatio = img.width / img.height;

          let width = containerMaxWidth;
          let height = containerMaxWidth / aspectRatio;

          if (height > containerMaxHeight) {
            height = containerMaxHeight;
            width = containerMaxHeight * aspectRatio;
          }

          setTshirtDimensions({ width, height });
        }

        setTshirtImage(img);
      };
    };

    loadImage();
  }, [view]);

  // Load all artworks
  useEffect(() => {
    if (artworks.length === 0) {
      setArtworkImages([]);
      setSelectedId(null);
      imageRefs.current = [];
      return;
    }

    const loadNewArtworks = async () => {
      const promises = artworks.map((artwork) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new window.Image();
          image.src = artwork.url;
          image.crossOrigin = 'anonymous';
          image.onload = () => resolve(image);
          image.onerror = reject;
        });
      });

      try {
        const loadedImages = await Promise.all(promises);
        setArtworkImages(loadedImages);
        imageRefs.current = new Array(loadedImages.length).fill(null);

        // Auto-select newly uploaded artwork (no position saved)
        const lastArtwork = artworks[artworks.length - 1];
        if (lastArtwork && !lastArtwork.position) {
          setSelectedId(`artwork-${artworks.length - 1}`);
        }
      } catch (err) {
        console.error('Failed to load artworks:', err);
      }
    };

    loadNewArtworks();
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
    // Check if clicked on empty canvas or the t-shirt image (not the artwork)
    const clickedOnStage = e.target === e.target.getStage();
    const clickedOnTshirt = e.target.image === tshirtImage;

    if (clickedOnStage || clickedOnTshirt) {
      setSelectedId(null);
    }
  };

  if (error) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">{error}</p>
          <p className="text-xs text-gray-400">Using fallback preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Instructions overlay - Absolutely positioned above shirt */}
      {artworkImages.length > 0 && selectedId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-4 py-2 rounded-full z-10">
          Drag to move • Corners to resize • Rotate to spin • Click away to finish
        </div>
      )}

      {/* Simple "Click to edit" hint when not selected */}
      {artworkImages.length > 0 && !selectedId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-gray-800/60 text-white text-xs px-4 py-2 rounded-full z-10">
          Click artwork to edit position and size
        </div>
      )}

      <Stage
        ref={stageRef}
        width={tshirtDimensions.width}
        height={tshirtDimensions.height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          {/* T-shirt background */}
          {tshirtImage && (
            <KonvaImage
              image={tshirtImage}
              x={0}
              y={0}
              width={tshirtDimensions.width}
              height={tshirtDimensions.height}
              onClick={() => setSelectedId(null)}
              onTap={() => setSelectedId(null)}
              // For neck view, crop to fill the canvas
              {...(view === 'neck' ? {
                crop: {
                  x: 0,
                  y: 0,
                  width: tshirtImage.width,
                  height: tshirtImage.height
                }
              } : {})}
            />
          )}

          {/* Uploaded artworks */}
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
                  x={artwork.position?.x ?? (200 + index * 20)}
                  y={artwork.position?.y ?? (250 + index * 20)}
                  width={width}
                  height={height}
                  scaleX={artwork.position?.scaleX ?? 1}
                  scaleY={artwork.position?.scaleY ?? 1}
                  rotation={artwork.position?.rotation ?? 0}
                  draggable
                dragBoundFunc={(pos) => {
                  // Define the t-shirt boundaries (approximate area where shirt is visible)
                  const shirtBounds = {
                    minX: 80,
                    maxX: 470,
                    minY: 100,
                    maxY: 550
                  };

                  // Get current image dimensions
                  const node = imageRefs.current[index];
                  const imageWidth = node?.width() || 0;
                  const imageHeight = node?.height() || 0;
                  const scaleX = node?.scaleX() || 1;
                  const scaleY = node?.scaleY() || 1;

                  const scaledWidth = imageWidth * scaleX;
                  const scaledHeight = imageHeight * scaleY;

                  // Constrain position to keep artwork within shirt bounds
                  let newX = pos.x;
                  let newY = pos.y;

                  // Prevent artwork from going beyond left edge
                  if (newX < shirtBounds.minX) {
                    newX = shirtBounds.minX;
                  }
                  // Prevent artwork from going beyond right edge
                  if (newX + scaledWidth > shirtBounds.maxX) {
                    newX = shirtBounds.maxX - scaledWidth;
                  }
                  // Prevent artwork from going beyond top edge
                  if (newY < shirtBounds.minY) {
                    newY = shirtBounds.minY;
                  }
                  // Prevent artwork from going beyond bottom edge
                  if (newY + scaledHeight > shirtBounds.maxY) {
                    newY = shirtBounds.maxY - scaledHeight;
                  }

                  return {
                    x: newX,
                    y: newY
                  };
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
                    // Limit resize
                    if (newBox.width < 50 || newBox.height < 50) {
                      return oldBox;
                    }
                    // Limit maximum size
                    if (newBox.width > 400 || newBox.height > 400) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  enabledAnchors={[
                    'top-left',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                  ]}
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

TShirtCanvas.displayName = 'TShirtCanvas';

export default TShirtCanvas;
