import { useState, useEffect, useRef } from 'react';
import { Product, Variant, DecorationMethod, Placement } from '../types';
import { priceAPI, uploadAPI, designAPI } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Upload, ArrowDownToLine, Save } from 'lucide-react';
import TShirtCanvas from './TShirtCanvas';
import { useAuth } from '../contexts/AuthContext';
import SaveDesignModal from './SaveDesignModal';
import Toast from './Toast';

interface CustomizerProps {
  product: Product;
  variants: Variant[];
  decorationMethods: DecorationMethod[];
}

export default function Customizer({ product, variants }: CustomizerProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const getItem = useCartStore((state) => state.getItem);
  const canvasRef = useRef<any>(null);
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [loadedDesignId, setLoadedDesignId] = useState<string | null>(null);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);

  // Selection state
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedMethod] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Customization state - separate for each view
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [currentPlacement] = useState<string>('front_chest');
  const [view, setView] = useState<'front' | 'neck' | 'back'>('front');

  // Artwork state per view (now includes assetId for tracking)
  const [frontArtworks, setFrontArtworks] = useState<Array<{url: string, position: any, assetId?: string}>>([]);
  const [neckArtwork, setNeckArtwork] = useState<{url: string, position: any, assetId?: string} | null>(null);
  const [backArtworks, setBackArtworks] = useState<Array<{url: string, position: any, assetId?: string}>>([]);

  const [, setUploadedFile] = useState<any>(null);
  // Future feature: text input functionality
  // const [, setTextInput] = useState('');
  // const [textColor] = useState('#000000');

  // Current view's artwork
  const getCurrentArtworks = () => {
    if (view === 'front') return frontArtworks;
    if (view === 'neck') return neckArtwork ? [neckArtwork] : [];
    if (view === 'back') return backArtworks;
    return [];
  };

  const currentArtwork = getCurrentArtworks()[0] || null;

  // Price state (used internally for future price calculation feature)
  const [, setPriceQuote] = useState<any>(null);
  const [, setLoadingPrice] = useState(false);

  // Save design modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedDesignName, setSavedDesignName] = useState('');

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Calculate unit cost based on artwork
  const calculateUnitCost = (): number => {
    let unitCost = 12.98; // Base price

    // Count how many print locations have artwork
    const hasFrontArtwork = frontArtworks.length > 0;
    const hasBackArtwork = backArtworks.length > 0;
    const hasNeckLabel = neckArtwork !== null;

    // Count print locations (front and back only)
    const printLocations = [hasFrontArtwork, hasBackArtwork].filter(Boolean).length;

    // Add $5 for second print location (front + back)
    if (printLocations === 2) {
      unitCost += 5.00;
    }

    // Add $1 for neck label (always, regardless of other artworks)
    if (hasNeckLabel) {
      unitCost += 1.00;
    }

    return unitCost;
  };

  const unitCost = calculateUnitCost();

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

  // Load design from URL param if present
  useEffect(() => {
    const designId = searchParams.get('designId');
    if (designId && isAuthenticated) {
      loadDesign(designId);
    }
  }, [searchParams, isAuthenticated]);

  // Load cart item for editing if present
  useEffect(() => {
    const cartItemId = searchParams.get('editCartItem');
    if (cartItemId) {
      const cartItem = getItem(cartItemId);
      if (cartItem) {
        setEditingCartItemId(cartItemId);
        // Load the design state from cart item
        setSelectedColor(cartItem.variantColor);
        setSelectedSize(cartItem.variantSize);
        setQuantity(cartItem.quantity);

        // Load customization data if available
        if (cartItem.customization) {
          if (cartItem.customization.frontArtworks) {
            setFrontArtworks(cartItem.customization.frontArtworks);
          }
          if (cartItem.customization.backArtworks) {
            setBackArtworks(cartItem.customization.backArtworks);
          }
          if (cartItem.customization.neckArtwork) {
            setNeckArtwork(cartItem.customization.neckArtwork);
          }
        }
      }
    }
  }, [searchParams, getItem]);

  const loadDesign = async (designId: string) => {
    try {
      const design = await designAPI.getById(designId);
      setLoadedDesignId(design.id);

      // Load the design data
      if (design.design_data) {
        if (design.design_data.front) {
          setFrontArtworks(design.design_data.front.map((pos: any) => ({
            url: '', // We'll need to load actual URLs from artwork_ids
            position: pos
          })));
        }
        if (design.design_data.back) {
          setBackArtworks(design.design_data.back.map((pos: any) => ({
            url: '',
            position: pos
          })));
        }
        if (design.design_data.neck && design.design_data.neck.length > 0) {
          setNeckArtwork({ url: '', position: design.design_data.neck[0] });
        }
      }

      // Set color/size if available
      if (design.variant_id) {
        const variant = variants.find(v => v.id === design.variant_id);
        if (variant) {
          setSelectedColor(variant.color);
          setSelectedSize(variant.size);
        }
      }
    } catch (error) {
      console.error('Error loading design:', error);
      alert('Failed to load design');
    }
  };

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

      // Create a local preview URL immediately for instant feedback
      const previewUrl = URL.createObjectURL(file);

      // Add artwork to the appropriate view with temporary blob URL
      const tempArtwork = { url: previewUrl, position: null, assetId: undefined };

      if (view === 'front') {
        if (frontArtworks.length < 4) {
          const artworkIndex = frontArtworks.length;
          setFrontArtworks([...frontArtworks, tempArtwork]);

          // Upload to server and update with permanent URL
          uploadAPI.uploadFile(file).then((asset) => {
            setFrontArtworks(prev => {
              const updated = [...prev];
              if (updated[artworkIndex]) {
                updated[artworkIndex] = {
                  url: `http://localhost:3001${asset.file_url}`,
                  position: updated[artworkIndex].position,
                  assetId: asset.id
                };
              }
              return updated;
            });
          }).catch(err => console.error('Upload failed:', err));
        } else {
          alert('Maximum 4 artworks allowed on front view');
          e.target.value = '';
          return;
        }
      } else if (view === 'neck') {
        if (neckArtwork) {
          alert('Only 1 artwork allowed on neck view. Remove existing artwork first.');
          e.target.value = '';
          return;
        }
        setNeckArtwork(tempArtwork);

        // Upload to server and update with permanent URL
        uploadAPI.uploadFile(file).then((asset) => {
          setNeckArtwork({
            url: `http://localhost:3001${asset.file_url}`,
            position: neckArtwork?.position || null,
            assetId: asset.id
          });
        }).catch(err => console.error('Upload failed:', err));
      } else if (view === 'back') {
        if (backArtworks.length < 4) {
          const artworkIndex = backArtworks.length;
          setBackArtworks([...backArtworks, tempArtwork]);

          // Upload to server and update with permanent URL
          uploadAPI.uploadFile(file).then((asset) => {
            setBackArtworks(prev => {
              const updated = [...prev];
              if (updated[artworkIndex]) {
                updated[artworkIndex] = {
                  url: `http://localhost:3001${asset.file_url}`,
                  position: updated[artworkIndex].position,
                  assetId: asset.id
                };
              }
              return updated;
            });
          }).catch(err => console.error('Upload failed:', err));
        } else {
          alert('Maximum 4 artworks allowed on back view');
          e.target.value = '';
          return;
        }
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

  // Future feature: Add text to design
  // const handleAddText = () => {
  //   if (!textInput.trim()) return;
  //
  //   const newPlacement: Placement = {
  //     location: currentPlacement as any,
  //     x: 5,
  //     y: 5,
  //     width: 4,
  //     height: 2,
  //     text_element_id: `text-${Date.now()}`,
  //     colors: [textColor],
  //   };
  //
  //   setPlacements([...placements, newPlacement]);
  //   setTextInput('');
  // };

  const handleDownloadDesign = () => {
    if (canvasRef.current && canvasRef.current.downloadImage) {
      canvasRef.current.downloadImage();
    }
  };

  const handleSaveDesign = () => {
    if (!isAuthenticated) {
      // Redirect to login, then back to this page
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    // Open the modal
    setShowSaveModal(true);
  };

  const performSaveDesign = async (designName: string) => {
    try {
      const designData = {
        front: frontArtworks.map(a => a.position),
        back: backArtworks.map(a => a.position),
        neck: neckArtwork ? [neckArtwork.position] : []
      };

      // Collect all artwork asset IDs from all views
      const artworkIds: string[] = [
        ...frontArtworks.filter(a => a.assetId).map(a => a.assetId!),
        ...backArtworks.filter(a => a.assetId).map(a => a.assetId!),
        ...(neckArtwork?.assetId ? [neckArtwork.assetId] : [])
      ];

      // Capture thumbnail
      let thumbnailUrl = '';
      if (canvasRef.current && canvasRef.current.getThumbnailBlob) {
        try {
          const thumbnailBlob = await canvasRef.current.getThumbnailBlob();
          if (thumbnailBlob) {
            // Convert blob to file
            const thumbnailFile = new File([thumbnailBlob], 'thumbnail.png', { type: 'image/png' });
            // Upload thumbnail
            const uploadedAsset = await uploadAPI.uploadFile(thumbnailFile);
            thumbnailUrl = uploadedAsset.file_url;
          }
        } catch (err) {
          console.error('Failed to capture thumbnail:', err);
          // Continue without thumbnail
        }
      }

      if (loadedDesignId) {
        // Update existing design
        await designAPI.update(loadedDesignId, {
          name: designName,
          variantId: selectedVariant?.id,
          designData,
          artworkIds,
          thumbnailUrl
        });
        setSavedDesignName(designName);
      } else {
        // Save new design
        const saved = await designAPI.save({
          name: designName,
          productId: product.id,
          variantId: selectedVariant?.id,
          designData,
          artworkIds,
          thumbnailUrl
        });
        setLoadedDesignId(saved.id);
        setSavedDesignName(designName);
      }
    } catch (error: any) {
      console.error('Error saving design:', error);
      throw error; // Re-throw so the modal can handle it
    }
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      setToastMessage('Please select a color and size');
      setShowToast(true);
      return;
    }

    // Capture mockup image from canvas
    let mockupUrl;
    try {
      if (canvasRef.current && canvasRef.current.captureImage) {
        mockupUrl = canvasRef.current.captureImage();
      }
    } catch (error) {
      console.error('Error capturing mockup:', error);
    }

    // Use selected variant or create a temporary one for Navy
    const variant = selectedVariant || {
      id: `temp-${selectedColor}-${selectedSize}`,
      color: selectedColor,
      size: selectedSize,
      base_price: 12.98
    };

    const cartItem = {
      id: editingCartItemId || `${variant.id}-${Date.now()}`,
      variantId: variant.id,
      productTitle: product.title,
      variantColor: selectedColor,
      variantSize: selectedSize,
      quantity,
      unitPrice: unitCost,
      customization: {
        method: selectedMethod || 'screen_print',
        placements,
        frontArtworks,
        backArtworks,
        neckArtwork,
      },
      mockupUrl, // Include the mockup image
    };

    if (editingCartItemId) {
      // Update existing cart item
      updateItem(editingCartItemId, cartItem);
      setToastMessage('Cart item updated successfully!');
    } else {
      // Add new item to cart
      addItem(cartItem);
      setToastMessage('Added to cart successfully!');
    }

    setShowToast(true);

    // Navigate to cart after showing toast
    setTimeout(() => {
      navigate('/cart');
    }, 1500);
  };

  // const [customizationMode, setCustomizationMode] = useState<'15' | '50'>('15');
  const [colorSectionOpen, setColorSectionOpen] = useState(true);
  const [frontArtworkSectionOpen, setFrontArtworkSectionOpen] = useState(false);
  const [backArtworkSectionOpen, setBackArtworkSectionOpen] = useState(false);
  const [neckLabelSectionOpen, setNeckLabelSectionOpen] = useState(false);

  // Auto-open appropriate section when view changes
  useEffect(() => {
    if (view === 'neck') {
      setNeckLabelSectionOpen(true);
      setFrontArtworkSectionOpen(false);
      setBackArtworkSectionOpen(false);
    } else if (view === 'front') {
      setFrontArtworkSectionOpen(true);
      setBackArtworkSectionOpen(false);
      setNeckLabelSectionOpen(false);
    } else if (view === 'back') {
      setBackArtworkSectionOpen(true);
      setFrontArtworkSectionOpen(false);
      setNeckLabelSectionOpen(false);
    }
  }, [view]);

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

          {/* Save Design Button and Price - Right */}
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={handleDownloadDesign}
              disabled={!currentArtwork}
              title="Download Design"
              className={`p-2 rounded-md transition-colors ${
                currentArtwork
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ArrowDownToLine size={18} />
            </button>
            <button
              onClick={handleSaveDesign}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md transition-colors bg-black text-white hover:bg-gray-800"
            >
              <Save size={14} />
              {loadedDesignId ? 'Update Design' : 'Save Design'}
            </button>
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
              onClick={() => setView('back')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'back'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Back
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

            {/* Front Artwork Section */}
            <div className="border-t border-gray-200 pt-5 pb-4">
              <button
                onClick={() => setFrontArtworkSectionOpen(!frontArtworkSectionOpen)}
                className="w-full flex items-center justify-between mb-4 group"
              >
                <h3 className="text-sm font-semibold">Front Artwork</h3>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
                    {frontArtworks.length}
                  </span>
                  <span className="text-gray-400 group-hover:text-gray-600">
                    {frontArtworkSectionOpen ? '−' : '+'}
                  </span>
                </div>
              </button>

              {frontArtworkSectionOpen && (
                <div className="space-y-4">
                  {frontArtworks.length < 4 && (
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => setView('front')}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,application/pdf"
                        onChange={(e) => {
                          setView('front');
                          handleFileUpload(e);
                        }}
                        className="hidden"
                        id="front-artwork-upload"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor="front-artwork-upload" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 text-gray-300" size={28} />
                        <p className="text-xs text-gray-600 font-medium">
                          Upload front artwork (up to 4)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG or PDF</p>
                      </label>
                    </div>
                  )}

                  {/* Display uploaded front artworks */}
                  {frontArtworks.map((artwork, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                            <img src={artwork.url} alt="Front Artwork" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Artwork {index + 1}</p>
                            <p className="text-xs text-gray-500">Click front view to edit</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFrontArtworks(frontArtworks.filter((_, i) => i !== index));
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Back Artwork Section */}
            <div className="border-t border-gray-200 pt-5 pb-4">
              <button
                onClick={() => setBackArtworkSectionOpen(!backArtworkSectionOpen)}
                className="w-full flex items-center justify-between mb-4 group"
              >
                <h3 className="text-sm font-semibold">Back Artwork</h3>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
                    {backArtworks.length}
                  </span>
                  <span className="text-gray-400 group-hover:text-gray-600">
                    {backArtworkSectionOpen ? '−' : '+'}
                  </span>
                </div>
              </button>

              {backArtworkSectionOpen && (
                <div className="space-y-4">
                  {backArtworks.length < 4 && (
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => setView('back')}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,application/pdf"
                        onChange={(e) => {
                          setView('back');
                          handleFileUpload(e);
                        }}
                        className="hidden"
                        id="back-artwork-upload"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor="back-artwork-upload" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 text-gray-300" size={28} />
                        <p className="text-xs text-gray-600 font-medium">
                          Upload back artwork (up to 4)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG or PDF</p>
                      </label>
                    </div>
                  )}

                  {/* Display uploaded back artworks */}
                  {backArtworks.map((artwork, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                            <img src={artwork.url} alt="Back Artwork" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Artwork {index + 1}</p>
                            <p className="text-xs text-gray-500">Click back view to edit</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setBackArtworks(backArtworks.filter((_, i) => i !== index));
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
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
                    {neckArtwork ? '1' : '0'}
                  </span>
                  <span className="text-gray-400 group-hover:text-gray-600">
                    {neckLabelSectionOpen ? '−' : '+'}
                  </span>
                </div>
              </button>

              {neckLabelSectionOpen && (
                <div className="space-y-4">
                  {!neckArtwork && (
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => setView('neck')}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,application/pdf"
                        onChange={(e) => {
                          setView('neck');
                          handleFileUpload(e);
                        }}
                        className="hidden"
                        id="neck-label-upload"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor="neck-label-upload" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 text-gray-300" size={28} />
                        <p className="text-xs text-gray-600 font-medium">
                          Upload neck label
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG or PDF</p>
                      </label>
                    </div>
                  )}

                  {/* Display uploaded neck label */}
                  {neckArtwork && (
                    <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                            <img src={neckArtwork.url} alt="Neck Label" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Neck Label</p>
                            <p className="text-xs text-gray-500">Click neck view to edit</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNeckArtwork(null)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
            <div className="border-t border-gray-200 pt-5 pb-4">
              <div className={`grid ${quantity >= 2 ? 'grid-cols-4' : 'grid-cols-3'} gap-3`}>
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
                    ${unitCost.toFixed(2)}
                  </div>
                </div>
                {quantity >= 2 && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Total cost</label>
                    <div className="text-sm font-semibold">
                      ${(unitCost * quantity).toFixed(2)}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Delivery</label>
                  <div className="text-xs font-semibold">4 Nov</div>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedColor || !selectedSize}
                className="w-full py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {editingCartItemId ? 'Update Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Design Modal */}
      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={performSaveDesign}
        isUpdating={!!loadedDesignId}
        currentName={savedDesignName}
      />

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
