import { useState, useEffect, useRef } from 'react';
import { Product, Variant, DecorationMethod, Placement } from '../types';
import { priceAPI, uploadAPI } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, Type, Palette, Download, ArrowDownToLine } from 'lucide-react';
import TShirtCanvas from './TShirtCanvas';

interface CustomizerProps {
  product: Product;
  variants: Variant[];
  decorationMethods: DecorationMethod[];
}

export default function Customizer({ product, variants, decorationMethods }: CustomizerProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const canvasRef = useRef<any>(null);

  // Selection state
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Customization state - separate for each view
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [currentPlacement, setCurrentPlacement] = useState<string>('front_chest');
  const [view, setView] = useState<'front' | 'neck' | 'back'>('front');

  // Artwork state per view
  const [frontArtworks, setFrontArtworks] = useState<Array<{url: string, position: any}>>([]);
  const [neckArtwork, setNeckArtwork] = useState<{url: string, position: any} | null>(null);
  const [backArtworks, setBackArtworks] = useState<Array<{url: string, position: any}>>([]);

  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');

  // Current view's artwork
  const getCurrentArtworks = () => {
    if (view === 'front') return frontArtworks;
    if (view === 'neck') return neckArtwork ? [neckArtwork] : [];
    if (view === 'back') return backArtworks;
    return [];
  };

  const currentArtwork = getCurrentArtworks()[0] || null;

  // Price state
  const [priceQuote, setPriceQuote] = useState<any>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Get unique colors and sizes (add Navy if not present)
  const dbColors = [...new Set(variants.map((v) => v.color))];
  const colors = dbColors.includes('Navy') ? dbColors : [...dbColors, 'Navy'];
  const sizes = [...new Set(variants.map((v) => v.size))].sort((a, b) => {
    const order = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
    return order.indexOf(a) - order.indexOf(b);
  });

  // Update selected variant when color/size changes
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = variants.find((v) => v.color === selectedColor && v.size === selectedSize);
      setSelectedVariant(variant || null);
    }
  }, [selectedColor, selectedSize, variants]);

  // Calculate price when relevant fields change
  useEffect(() => {
    if (selectedVariant && selectedMethod && placements.length > 0) {
      calculatePrice();
    }
  }, [selectedVariant, selectedMethod, placements, quantity]);

  const calculatePrice = async () => {
    if (!selectedVariant) return;

    setLoadingPrice(true);
    try {
      const quote = await priceAPI.calculate({
        variant_id: selectedVariant.id,
        method: selectedMethod,
        placements,
        quantity,
      });
      setPriceQuote(quote);
    } catch (error) {
      console.error('Failed to calculate price:', error);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check DPI for raster images
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        const arrayBuffer = await file.arrayBuffer();
        const dpi = await checkImageDPI(arrayBuffer, file.type);

        if (dpi && dpi < 300) {
          const proceed = window.confirm(
            `Warning: This image has a DPI of ${dpi}, which is below the required 300 DPI for high-quality DTG printing. The print quality may be poor.\n\nDo you want to upload it anyway?`
          );
          if (!proceed) {
            e.target.value = ''; // Reset file input
            return;
          }
        }
      }

      // Create a local preview URL immediately
      const previewUrl = URL.createObjectURL(file);

      // Add artwork to the appropriate view
      const newArtwork = { url: previewUrl, position: null };

      if (view === 'front') {
        // Front can have up to 4 artworks
        if (frontArtworks.length < 4) {
          setFrontArtworks([...frontArtworks, newArtwork]);
        } else {
          alert('Maximum 4 artworks allowed on front view');
          e.target.value = '';
          return;
        }
      } else if (view === 'neck') {
        // Neck can only have 1 artwork
        if (neckArtwork) {
          alert('Only 1 artwork allowed on neck view. Remove existing artwork first.');
          e.target.value = '';
          return;
        }
        setNeckArtwork(newArtwork);
      } else if (view === 'back') {
        // Back can have up to 4 artworks
        if (backArtworks.length < 4) {
          setBackArtworks([...backArtworks, newArtwork]);
        } else {
          alert('Maximum 4 artworks allowed on back view');
          e.target.value = '';
          return;
        }
      }

      // Upload to server in background
      try {
        const asset = await uploadAPI.uploadFile(file);
        setUploadedFile(asset);

        // Add as placement
        const newPlacement: Placement = {
          location: currentPlacement as any,
          x: 5,
          y: 5,
          width: 4,
          height: 4,
          artwork_id: asset.id,
          colors: ['#000000'],
        };

        setPlacements([...placements, newPlacement]);
      } catch (uploadError) {
        console.error('Server upload failed (continuing with local preview):', uploadError);
      }

      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file');
      e.target.value = '';
    }
  };

  // Function to check image DPI
  const checkImageDPI = async (arrayBuffer: ArrayBuffer, mimeType: string): Promise<number | null> => {
    const view = new DataView(arrayBuffer);

    try {
      if (mimeType === 'image/png') {
        // PNG DPI is stored in pHYs chunk
        let offset = 8; // Skip PNG signature

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

            if (unit === 1) { // meters
              // Convert pixels per meter to DPI
              const dpi = Math.round(pixelsPerUnitX / 39.3701);
              return dpi;
            }
          }

          offset += length + 12;
        }
      } else if (mimeType === 'image/jpeg') {
        // JPEG DPI is stored in JFIF or EXIF
        let offset = 2; // Skip JPEG SOI marker

        while (offset < view.byteLength) {
          const marker = view.getUint16(offset);

          if (marker === 0xFFE0) { // JFIF APP0
            const densityUnits = view.getUint8(offset + 11);
            const xDensity = view.getUint16(offset + 12);

            if (densityUnits === 1) { // DPI
              return xDensity;
            } else if (densityUnits === 2) { // dots per cm
              return Math.round(xDensity * 2.54);
            }
            break;
          }

          const segmentLength = view.getUint16(offset + 2);
          offset += segmentLength + 2;
        }
      }
    } catch (error) {
      console.error('Error reading DPI:', error);
    }

    return null;
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;

    const newPlacement: Placement = {
      location: currentPlacement as any,
      x: 5,
      y: 5,
      width: 4,
      height: 2,
      text_element_id: `text-${Date.now()}`,
      colors: [textColor],
    };

    setPlacements([...placements, newPlacement]);
    setTextInput('');
  };

  const handleDownloadDesign = () => {
    if (canvasRef.current && canvasRef.current.downloadImage) {
      canvasRef.current.downloadImage();
    }
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert('Please select a color and size');
      return;
    }

    // Use selected variant or create a temporary one for Navy
    const variant = selectedVariant || {
      id: `temp-${selectedColor}-${selectedSize}`,
      color: selectedColor,
      size: selectedSize,
      base_price: 12.98
    };

    const cartItem = {
      id: `${variant.id}-${Date.now()}`,
      variantId: variant.id,
      productTitle: product.title,
      variantColor: selectedColor,
      variantSize: selectedSize,
      quantity,
      unitPrice: 12.98,
      customization: {
        method: selectedMethod || 'screen_print',
        placements,
        artworkUrl: uploadedArtworkUrl,
        artworkPosition,
      },
    };

    addItem(cartItem);
    alert('Added to cart!');
    navigate('/cart');
  };

  const [customizationMode, setCustomizationMode] = useState<'15' | '50'>('15');
  const [colorSectionOpen, setColorSectionOpen] = useState(true);
  const [artworkSectionOpen, setArtworkSectionOpen] = useState(false);
  const [neckLabelSectionOpen, setNeckLabelSectionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Compact Header for Customizer */}
      <div className="border-b border-gray-200 bg-white">
        <div className="relative px-6 py-1.5 flex items-center">
          {/* Product Title - Left */}
          <h1 className="text-sm font-bold">
            {product.title}
          </h1>

          {/* Raspberry Logo - Center */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-lg font-bold hover:text-gray-600 transition-colors">
            Raspberry
          </Link>

          {/* Download Button and Price - Right */}
          <div className="ml-auto flex items-center gap-4">
            {currentArtwork && (
              <button
                onClick={handleDownloadDesign}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                <ArrowDownToLine size={14} />
                Download
              </button>
            )}
            <div className="text-sm font-normal">
              from ${(12.98).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] h-[calc(100vh-40px)]">
        {/* Left - Canvas Area */}
        <div className="bg-white flex flex-col relative h-full overflow-hidden">
          {/* Interactive Canvas Preview */}
          <div className={`absolute inset-0 flex items-center justify-center ${view === 'neck' ? 'pt-0 pb-0 px-0' : 'pt-2 pb-16 px-6'}`}>
            <TShirtCanvas
              ref={canvasRef}
              tshirtColor={selectedColor}
              artworks={getCurrentArtworks()}
              onArtworkPositionChange={(pos, index) => {
                // Save position to current view's artwork at specific index
                if (view === 'front') {
                  const updated = [...frontArtworks];
                  updated[index] = { ...updated[index], position: pos };
                  setFrontArtworks(updated);
                } else if (view === 'neck' && neckArtwork) {
                  setNeckArtwork({ ...neckArtwork, position: pos });
                } else if (view === 'back') {
                  const updated = [...backArtworks];
                  updated[index] = { ...updated[index], position: pos };
                  setBackArtworks(updated);
                }
              }}
              view={view}
            />
          </div>

          {/* View Switcher - Minimal */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg px-2 py-2 flex gap-1">
            <button
              onClick={() => setView('front')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'front'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setView('neck')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'neck'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Neck
            </button>
            <button
              onClick={() => setView('back')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'back'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Back
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-5 space-y-1">

            {/* Garment Color Section */}
            <div className="border-t border-gray-200 pt-5 pb-4">
              <button
                onClick={() => setColorSectionOpen(!colorSectionOpen)}
                className="w-full flex items-center justify-between mb-4 group"
              >
                <h3 className="text-sm font-semibold">Garment Color</h3>
                <div className="flex items-center gap-3">
                  {selectedColor && (
                    <span
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{
                        backgroundColor: selectedColor === 'White' ? '#FFFFFF' : selectedColor === 'Black' ? '#000000' : selectedColor.toLowerCase()
                      }}
                    ></span>
                  )}
                  <span className="text-gray-400 group-hover:text-gray-600">
                    {colorSectionOpen ? '−' : '+'}
                  </span>
                </div>
              </button>

              {colorSectionOpen && (
                <div className="space-y-4">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Pre-developed</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-md border transition-all ${
                          selectedColor === color
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                          style={{
                            backgroundColor:
                              color === 'White' ? '#FFFFFF' :
                              color === 'Black' ? '#000000' :
                              color === 'Navy' ? '#001f3f' :
                              color.toLowerCase()
                          }}
                        ></div>
                        <span className="text-xs font-medium">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Artwork Section */}
            <div className="border-t border-gray-200 pt-5 pb-4">
              <button
                onClick={() => setArtworkSectionOpen(!artworkSectionOpen)}
                className="w-full flex items-center justify-between mb-4 group"
              >
                <h3 className="text-sm font-semibold">Artwork</h3>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
                    +
                  </span>
                  <span className="text-gray-400 group-hover:text-gray-600">
                    {artworkSectionOpen ? '−' : '+'}
                  </span>
                </div>
              </button>

              {artworkSectionOpen && (
                <div className="space-y-4">
                  {getCurrentArtworks().length === 0 || (view === 'front' && frontArtworks.length < 4) || (view === 'back' && backArtworks.length < 4) || view === 'neck' ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center hover:border-gray-300 transition-colors">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="artwork-upload"
                      />
                      <label htmlFor="artwork-upload" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 text-gray-300" size={28} />
                        <p className="text-xs text-gray-600 font-medium">
                          Upload artwork {view === 'neck' ? '(1 max)' : '(up to 4)'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG or PDF</p>
                      </label>
                    </div>
                  ) : null}

                  {/* Display uploaded artworks for current view */}
                  {getCurrentArtworks().map((artwork, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                            <img src={artwork.url} alt="Artwork" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Artwork {index + 1}</p>
                            <p className="text-xs text-gray-500">Drag to position on canvas</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (view === 'front') {
                              setFrontArtworks(frontArtworks.filter((_, i) => i !== index));
                            } else if (view === 'neck') {
                              setNeckArtwork(null);
                            } else if (view === 'back') {
                              setBackArtworks(backArtworks.filter((_, i) => i !== index));
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Print Method - Button Style */}
                  <div>
                    <label className="block text-xs font-medium mb-3 text-gray-700">Print method</label>
                    <div className="grid grid-cols-1 gap-2">
                      {decorationMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.name)}
                          className={`px-4 py-3 text-xs font-medium rounded-md border-2 transition-all text-left ${
                            selectedMethod === method.name
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold">{method.display_name}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{method.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Placement Location - Button Grid */}
                  <div>
                    <label className="block text-xs font-medium mb-3 text-gray-700">Print location</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setCurrentPlacement('front_chest')}
                        className={`px-3 py-2.5 text-xs font-medium rounded-md border-2 transition-all ${
                          currentPlacement === 'front_chest'
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Front Chest
                      </button>
                      <button
                        onClick={() => setCurrentPlacement('back_center')}
                        className={`px-3 py-2.5 text-xs font-medium rounded-md border-2 transition-all ${
                          currentPlacement === 'back_center'
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Back Center
                      </button>
                      <button
                        onClick={() => setCurrentPlacement('sleeve_left')}
                        className={`px-3 py-2.5 text-xs font-medium rounded-md border-2 transition-all ${
                          currentPlacement === 'sleeve_left'
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Left Sleeve
                      </button>
                      <button
                        onClick={() => setCurrentPlacement('sleeve_right')}
                        className={`px-3 py-2.5 text-xs font-medium rounded-md border-2 transition-all ${
                          currentPlacement === 'sleeve_right'
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Right Sleeve
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Neck Label Section */}
            <div className="border-t border-gray-200 pt-5 pb-4">
              <button
                onClick={() => setNeckLabelSectionOpen(!neckLabelSectionOpen)}
                className="w-full flex items-center justify-between mb-4 group"
              >
                <h3 className="text-sm font-semibold">Neck Label</h3>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
                    +
                  </span>
                  <span className="text-gray-400 group-hover:text-gray-600">
                    {neckLabelSectionOpen ? '−' : '+'}
                  </span>
                </div>
              </button>
            </div>

            {/* Size Selection */}
            <div className="border-t border-gray-200 pt-5 pb-4">
              <label className="block text-xs font-medium mb-3">Size</label>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 border rounded-md text-xs font-medium transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity, Price, Delivery */}
            <div className="border-t border-gray-200 pt-5 pb-4 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Unit cost</label>
                <div className="text-sm font-semibold">
                  {priceQuote ? `$${(priceQuote.subtotal / quantity).toFixed(2)}` : '$0.00'}
                </div>
                {priceQuote && (
                  <div className="text-xs text-gray-400 line-through">
                    ${(Number(selectedVariant?.base_price || 0) + 5).toFixed(2)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Delivery</label>
                <div className="text-xs font-semibold">4 Nov</div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedColor || !selectedSize}
                className="w-full py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
