import { useState, useEffect, useRef } from 'react';
import { Product, Variant } from '../types';
import { uploadAPI, designAPI } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Upload, ArrowDownToLine, Save } from 'lucide-react';
import TShirtCanvas from './TShirtCanvas';
import HoodieCanvas from './HoodieCanvas';
import { useAuth } from '../contexts/AuthContext';
import SaveDesignModal from './SaveDesignModal';
import Toast from './Toast';
import { trackCustomizationStarted, trackDesignSaved } from '../utils/analytics';
import { TSHIRT_BASE_PRICE, calculateUnitCost } from '../constants/pricing';
import { SIZES, MAX_ARTWORKS_PER_VIEW } from '../constants/products';
import { getFullAssetUrl, createBlobUrl } from '../utils/urlHelpers';
import { validateImageDPI, promptForLowDPIUpload } from '../utils/imageValidation';

interface CustomizerProps {
  product: Product;
  variants: Variant[];
}

// Helper function to calculate estimated delivery date
const getEstimatedDeliveryDate = (): string => {
  const today = new Date();
  let businessDaysToAdd = 7; // 7 business days estimate
  let currentDate = new Date(today);

  while (businessDaysToAdd > 0) {
    currentDate.setDate(currentDate.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      businessDaysToAdd--;
    }
  }

  // Format as "D MMM" (e.g., "4 Nov")
  const day = currentDate.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[currentDate.getMonth()];

  return `${day} ${month}`;
};

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
  const hasLoadedDesignRef = useRef<string | null>(null);

  // Track customization started
  useEffect(() => {
    trackCustomizationStarted(product.title);
  }, []); // Run only once on mount

  // Selection state
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Customization state - separate for each view
  const [view, setView] = useState<'front' | 'neck' | 'back'>('front');

  const [frontArtworks, setFrontArtworks] = useState<Array<{url: string, position: any, assetId?: string}>>([]);
  const [neckArtwork, setNeckArtwork] = useState<{url: string, position: any, assetId?: string} | null>(null);
  const [backArtworks, setBackArtworks] = useState<Array<{url: string, position: any, assetId?: string}>>([]);

  // Current view's artwork
  const getCurrentArtworks = () => {
    if (view === 'front') return frontArtworks;
    if (view === 'neck') return neckArtwork ? [neckArtwork] : [];
    if (view === 'back') return backArtworks;
    return [];
  };

  const currentArtwork = getCurrentArtworks()[0] || null;
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedDesignName, setSavedDesignName] = useState('');

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const unitCost = calculateUnitCost(
    frontArtworks.length > 0,
    backArtworks.length > 0,
    neckArtwork !== null,
    TSHIRT_BASE_PRICE
  );

  const dbColors = [...new Set(variants.map((v) => v.color))];
  const colors = dbColors.includes('Navy') ? dbColors : [...dbColors, 'Navy'];
  const sizes = [...new Set(variants.map((v) => v.size))].sort((a, b) => {
    return SIZES.indexOf(a as any) - SIZES.indexOf(b as any);
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
    if (designId && isAuthenticated && variants.length > 0 && hasLoadedDesignRef.current !== designId) {
      hasLoadedDesignRef.current = designId;
      loadDesign(designId);
    }
  }, [searchParams, isAuthenticated, variants]);

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
      console.log('[LOAD] Full design object:', JSON.stringify(design, null, 2));
      setLoadedDesignId(design.id);
      setSavedDesignName(design.name); // Set the saved design name

      // Create array of all artwork IDs in order (front, back, neck)
      const allArtworkIds = design.artwork_ids || [];
      const artworkUrls = design.artwork_urls || {};


      // Track which artwork ID we're currently processing
      let artworkIndex = 0;

      // Load the design data with actual artwork URLs
      if (design.design_data) {
        if (design.design_data.front && design.design_data.front.length > 0) {
          const frontArtworkData = design.design_data.front.map((pos: any) => {
            const assetId = allArtworkIds[artworkIndex];
            const url = assetId ? getFullAssetUrl(artworkUrls[assetId]) : '';
            artworkIndex++;
            return {
              url: url || '',
              position: pos,
              assetId: assetId
            };
          });
          setFrontArtworks(frontArtworkData);
        }

        if (design.design_data.back && design.design_data.back.length > 0) {
          const backArtworkData = design.design_data.back.map((pos: any) => {
            const assetId = allArtworkIds[artworkIndex];
            const url = assetId ? getFullAssetUrl(artworkUrls[assetId]) : '';
            artworkIndex++;
            return {
              url: url || '',
              position: pos,
              assetId: assetId
            };
          });
          setBackArtworks(backArtworkData);
        }

        if (design.design_data.neck && design.design_data.neck.length > 0) {
          const assetId = allArtworkIds[artworkIndex];
          const url = assetId ? getFullAssetUrl(artworkUrls[assetId]) : '';
          setNeckArtwork({
            url: url || '',
            position: design.design_data.neck[0],
            assetId: assetId
          });
        }
      }

      // Set color/size/variant if available
      console.log('[LOAD] Design variant_id:', design.variant_id);
      console.log('[LOAD] Design variant_color:', design.variant_color);
      console.log('[LOAD] Design variant_size:', design.variant_size);
      console.log('[LOAD] Design data color/size:', design.design_data?.selectedColor, design.design_data?.selectedSize);

      // PRIORITY: design_data.selectedColor takes precedence over variant_color
      // This is because Navy (and other UI-only colors) are stored in design_data
      let colorToSet: string | null = null;
      let sizeToSet: string | null = null;

      // First: Check design_data for the most recent color selection
      if (design.design_data?.selectedColor) {
        console.log('[LOAD] Using color from design_data (highest priority):', design.design_data.selectedColor);
        colorToSet = design.design_data.selectedColor;
        sizeToSet = design.design_data.selectedSize || 'M';

        // Try to find a matching variant for this color
        const variant = variants.find(v => v.color === colorToSet && v.size === sizeToSet);
        if (variant) {
          console.log('[LOAD] Found matching variant for design_data color:', variant);
          setSelectedVariant(variant);
        } else {
          console.log('[LOAD] No variant found for color:', colorToSet, '(UI-only color like Navy)');
        }
      }
      // Second: Fall back to variant_id/variant_color if no design_data
      else if (design.variant_id) {
        let variant = variants.find(v => v.id === design.variant_id);
        console.log('[LOAD] Found variant by ID:', variant);

        // If variant not found by ID, try to find by color and size from JOIN
        if (!variant && design.variant_color && design.variant_size) {
          console.log('[LOAD] Variant ID not found, trying color/size lookup:', design.variant_color, design.variant_size);
          variant = variants.find(v => v.color === design.variant_color && v.size === design.variant_size);
          console.log('[LOAD] Found variant by color/size:', variant);
        }

        if (variant) {
          console.log('[LOAD] Setting color/size/variant from variant:', variant.color, variant.size);
          colorToSet = variant.color;
          sizeToSet = variant.size;
          setSelectedVariant(variant);
        } else if (design.variant_color) {
          // No variant found, but we have color info from JOIN
          console.log('[LOAD] No variant found, using color from JOIN:', design.variant_color);
          colorToSet = design.variant_color;
          sizeToSet = design.variant_size;
        }
      }

      // Apply the color and size
      if (colorToSet) {
        setSelectedColor(colorToSet);
        setSelectedSize(sizeToSet || 'M');
      }
    } catch (error) {
      console.error('Error loading design:', error);
      alert('Failed to load design');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { valid, dpi } = await validateImageDPI(file);
      if (!valid && dpi) {
        if (!promptForLowDPIUpload(dpi)) {
          e.target.value = '';
          return;
        }
      }

      const previewUrl = createBlobUrl(file);

      // Add artwork to the appropriate view with temporary blob URL
      const tempArtwork = { url: previewUrl, position: null, assetId: undefined };

      if (view === 'front') {
        if (frontArtworks.length < MAX_ARTWORKS_PER_VIEW) {
          const artworkIndex = frontArtworks.length;
          setFrontArtworks([...frontArtworks, tempArtwork]);

          uploadAPI.uploadFile(file).then((asset) => {
            setFrontArtworks(prev => {
              const updated = [...prev];
              if (updated[artworkIndex]) {
                updated[artworkIndex] = {
                  url: getFullAssetUrl(asset.file_url),
                  position: updated[artworkIndex].position,
                  assetId: asset.id
                };
              }
              return updated;
            });
          }).catch(err => console.error('Upload failed:', err));
        } else {
          alert(`Maximum ${MAX_ARTWORKS_PER_VIEW} artworks allowed on front view`);
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

        uploadAPI.uploadFile(file).then((asset) => {
          setNeckArtwork((prev) => ({
            url: getFullAssetUrl(asset.file_url),
            position: prev?.position || null,
            assetId: asset.id
          }));
        }).catch(err => console.error('Upload failed:', err));
      } else if (view === 'back') {
        if (backArtworks.length < MAX_ARTWORKS_PER_VIEW) {
          const artworkIndex = backArtworks.length;
          setBackArtworks([...backArtworks, tempArtwork]);

          uploadAPI.uploadFile(file).then((asset) => {
            setBackArtworks(prev => {
              const updated = [...prev];
              if (updated[artworkIndex]) {
                updated[artworkIndex] = {
                  url: getFullAssetUrl(asset.file_url),
                  position: updated[artworkIndex].position,
                  assetId: asset.id
                };
              }
              return updated;
            });
          }).catch(err => console.error('Upload failed:', err));
        } else {
          alert(`Maximum ${MAX_ARTWORKS_PER_VIEW} artworks allowed on back view`);
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

  const handleDownloadDesign = () => {
    if (canvasRef.current && canvasRef.current.downloadImage) {
      canvasRef.current.downloadImage();
    }
  };

  const handleSaveDesign = async () => {
    if (!isAuthenticated) {
      // Redirect to login, then back to this page
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    // If updating existing design, save directly without modal
    if (loadedDesignId && savedDesignName) {
      try {
        await performSaveDesign(savedDesignName);
        setToastMessage('Design updated successfully!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.error('Error updating design:', error);
        alert('Failed to update design');
      }
      return;
    }

    // Otherwise, open the modal for new design
    setShowSaveModal(true);
  };

  const performSaveDesign = async (designName: string) => {
    try {
      const designData = {
        front: frontArtworks.map(a => a.position),
        back: backArtworks.map(a => a.position),
        neck: neckArtwork ? [neckArtwork.position] : [],
        // Store color and size in design_data for colors without variants (like Navy)
        selectedColor: selectedColor,
        selectedSize: selectedSize || 'M'
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
        // Make sure we have the latest variant based on current color/size
        // Use 'M' as default size if no size selected
        const variantSize = selectedSize || 'M';
        const currentVariant = selectedVariant ||
          (selectedColor
            ? variants.find(v => v.color === selectedColor && v.size === variantSize)
            : null);

        console.log('[SAVE] Updating design with variant:', {
          variantId: currentVariant?.id,
          color: selectedColor,
          size: selectedSize,
          variant: currentVariant
        });

        await designAPI.update(loadedDesignId, {
          name: designName,
          variantId: currentVariant?.id,
          designData,
          artworkIds,
          thumbnailUrl
        });
        setSavedDesignName(designName);
      } else {
        // Save new design
        // Make sure we have the latest variant based on current color/size
        // Use 'M' as default size if no size selected
        const variantSize = selectedSize || 'M';
        const currentVariant = selectedVariant ||
          (selectedColor
            ? variants.find(v => v.color === selectedColor && v.size === variantSize)
            : null);

        console.log('[SAVE] Saving new design with variant:', {
          variantId: currentVariant?.id,
          color: selectedColor,
          size: selectedSize,
          variant: currentVariant
        });

        const saved = await designAPI.save({
          name: designName,
          productId: product.id,
          variantId: currentVariant?.id,
          designData,
          artworkIds,
          thumbnailUrl
        });
        setLoadedDesignId(saved.id);
        setSavedDesignName(designName);

        // Track design saved in Google Analytics
        trackDesignSaved(designName);
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
        method: 'dtg',
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
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="relative px-3 sm:px-6 py-3 sm:py-1.5 flex items-center justify-between">
          {/* Product Title - Left (hide on mobile, use as spacer) */}
          <div className="hidden sm:block text-sm font-bold min-w-0">
            {product.title}
          </div>

          {/* Mobile: Left back button */}
          <Link to="/" className="sm:hidden text-sm font-medium text-gray-600 hover:text-gray-900">
            ← Back
          </Link>

          {/* Raspberry Logo - Center (desktop only) */}
          <Link to="/" className="hidden sm:block absolute left-1/2 -translate-x-1/2 text-lg font-bold hover:text-gray-600 transition-colors">
            Raspberry
          </Link>

          {/* Save Design Button and Price - Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleDownloadDesign}
              disabled={!currentArtwork}
              title="Download Design"
              className={`hidden sm:flex p-2 rounded-md transition-colors ${
                currentArtwork
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ArrowDownToLine size={18} />
            </button>
            <button
              onClick={handleSaveDesign}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-1.5 text-xs font-medium rounded-md transition-colors bg-black text-white hover:bg-gray-800"
            >
              <Save size={14} />
              <span className="hidden sm:inline">{loadedDesignId ? 'Update' : 'Save'}</span>
              <span className="sm:hidden">{loadedDesignId ? 'Update' : 'Save'}</span>
            </button>
            <div className="hidden md:block text-sm font-normal whitespace-nowrap">
              from ${TSHIRT_BASE_PRICE.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] lg:h-[calc(100vh-40px)]">
        {/* Left - Canvas Area */}
        <div className="bg-white flex flex-col relative h-[60vh] lg:h-full overflow-hidden order-1">
          {/* Interactive Canvas Preview */}
          <div className={`absolute inset-0 flex items-center justify-center ${view === 'neck' ? 'pt-0 pb-0 px-0' : 'pt-2 pb-16 lg:pb-16 px-2 sm:px-6'}`}>
            {product.slug === 'classic-hoodie' ? (
              <HoodieCanvas
                ref={canvasRef}
                artworks={getCurrentArtworks()}
                view={view}
                onArtworkPositionChange={(pos, index) => {
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
                onArtworkDelete={(index) => {
                  if (view === 'front') {
                    const updated = frontArtworks.filter((_, i) => i !== index);
                    setFrontArtworks(updated);
                  } else if (view === 'neck') {
                    setNeckArtwork(null);
                  } else if (view === 'back') {
                    const updated = backArtworks.filter((_, i) => i !== index);
                    setBackArtworks(updated);
                  }
                }}
              />
            ) : (
              <TShirtCanvas
                ref={canvasRef}
                tshirtColor={selectedColor}
                artworks={getCurrentArtworks()}
                view={view}
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
              onArtworkDelete={(index) => {
                // Delete artwork from current view
                if (view === 'front') {
                  const updated = frontArtworks.filter((_, i) => i !== index);
                  setFrontArtworks(updated);
                } else if (view === 'neck') {
                  setNeckArtwork(null);
                } else if (view === 'back') {
                  const updated = backArtworks.filter((_, i) => i !== index);
                  setBackArtworks(updated);
                }
              }}
            />
            )}
          </div>

          {/* View Switcher - Minimal */}
          <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg px-1.5 sm:px-2 py-1.5 sm:py-2 flex gap-1">
            <button
              onClick={() => setView('front')}
              className={`px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'front'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setView('back')}
              className={`px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'back'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Back
            </button>
            <button
              onClick={() => setView('neck')}
              className={`px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-sm font-medium transition-colors ${
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
        <div className="bg-white border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto order-2 max-h-[40vh] lg:max-h-none">
          <div className="p-4 sm:p-5 space-y-1 pb-24 lg:pb-5">

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
                  <div className="text-xs font-semibold">{getEstimatedDeliveryDate()}</div>
                </div>
              </div>
            </div>

            {/* Confirm Button - Sticky on Mobile */}
            <div className="pt-4 lg:relative fixed bottom-0 left-0 right-0 p-4 bg-white border-t lg:border-t-0 border-gray-200 lg:p-0 shadow-lg lg:shadow-none">
              <button
                onClick={handleAddToCart}
                disabled={!selectedColor || !selectedSize}
                className="w-full py-3.5 sm:py-3 bg-black text-white text-base sm:text-sm font-medium rounded-full hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
