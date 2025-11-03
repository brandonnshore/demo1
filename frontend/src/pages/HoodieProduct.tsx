import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Upload, ArrowDownToLine, Save } from 'lucide-react';
import HoodieCanvas from '../components/HoodieCanvas';
import { uploadAPI, designAPI } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../contexts/AuthContext';
import SaveDesignModal from '../components/SaveDesignModal';
import Toast from '../components/Toast';

const HOODIE_PRODUCT_ID = '9f9e4e98-4128-4d09-af21-58e5523eed14';
const HOODIE_COLOR = 'Black';
const SIZES = ['S', 'M', 'L', 'XL', '2XL'] as const;
const BASE_PRICE = 35.99;
const DUAL_LOCATION_UPCHARGE = 5.00;
const NECK_LABEL_UPCHARGE = 1.00;
const MAX_ARTWORKS_PER_VIEW = 4;

const HOODIE_VARIANT_IDS: Record<string, string> = {
  'S': '242180eb-3029-40bc-b185-7ae8e3328b31',
  'M': '677f0bf4-98b9-4088-9151-7422312bbf76',
  'L': 'd6495a9b-0e81-40f7-81e4-3cf09eb25f2a',
  'XL': 'be75094a-c54b-4e3e-b861-b57aaaf2c774',
  '2XL': '0e302d1c-ce97-4a69-96df-eb603fca599e'
};

interface Artwork {
  url: string;
  position: ArtworkPosition | null;
  assetId?: string;
}

interface ArtworkPosition {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

interface CanvasRef {
  downloadImage: () => void;
  captureImage: () => string | null;
  getThumbnailBlob: () => Promise<Blob | null>;
}

export default function HoodieProduct() {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const canvasRef = useRef<CanvasRef>(null);
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [loadedDesignId, setLoadedDesignId] = useState<string | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedDesignName, setSavedDesignName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<'front' | 'back' | 'neck'>('front');

  const [frontArtworks, setFrontArtworks] = useState<Artwork[]>([]);
  const [backArtworks, setBackArtworks] = useState<Artwork[]>([]);
  const [neckArtwork, setNeckArtwork] = useState<Artwork | null>(null);

  const [frontArtworkSectionOpen, setFrontArtworkSectionOpen] = useState(false);
  const [backArtworkSectionOpen, setBackArtworkSectionOpen] = useState(false);
  const [neckLabelSectionOpen, setNeckLabelSectionOpen] = useState(false);

  const getCurrentArtworks = (): Artwork[] => {
    if (view === 'front') return frontArtworks;
    if (view === 'neck') return neckArtwork ? [neckArtwork] : [];
    if (view === 'back') return backArtworks;
    return [];
  };

  const calculateUnitCost = (): number => {
    let unitCost = BASE_PRICE;

    const printLocations = [
      frontArtworks.length > 0,
      backArtworks.length > 0
    ].filter(Boolean).length;

    if (printLocations === 2) {
      unitCost += DUAL_LOCATION_UPCHARGE;
    }

    if (neckArtwork !== null) {
      unitCost += NECK_LABEL_UPCHARGE;
    }

    return unitCost;
  };

  const unitCost = calculateUnitCost();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const previewUrl = URL.createObjectURL(file);
    const tempArtwork: Artwork = { url: previewUrl, position: null, assetId: undefined };

    if (view === 'front') {
      if (frontArtworks.length >= MAX_ARTWORKS_PER_VIEW) {
        alert(`Maximum ${MAX_ARTWORKS_PER_VIEW} artworks allowed on front view`);
        return;
      }
      const artworkIndex = frontArtworks.length;
      setFrontArtworks([...frontArtworks, tempArtwork]);

      uploadAPI.uploadFile(file).then((asset) => {
        setFrontArtworks(prev => {
          const updated = [...prev];
          if (updated[artworkIndex]) {
            updated[artworkIndex] = {
              ...updated[artworkIndex],
              url: `http://localhost:3001${asset.file_url}`,
              assetId: asset.id
            };
          }
          return updated;
        });
      }).catch(err => console.error('Upload failed:', err));
    } else if (view === 'neck') {
      if (neckArtwork) {
        alert('Only 1 artwork allowed on neck view');
        return;
      }
      setNeckArtwork(tempArtwork);

      uploadAPI.uploadFile(file).then((asset) => {
        setNeckArtwork(prev => prev ? {
          ...prev,
          url: `http://localhost:3001${asset.file_url}`,
          assetId: asset.id
        } : null);
      }).catch(err => console.error('Upload failed:', err));
    } else if (view === 'back') {
      if (backArtworks.length >= MAX_ARTWORKS_PER_VIEW) {
        alert(`Maximum ${MAX_ARTWORKS_PER_VIEW} artworks allowed on back view`);
        return;
      }
      const artworkIndex = backArtworks.length;
      setBackArtworks([...backArtworks, tempArtwork]);

      uploadAPI.uploadFile(file).then((asset) => {
        setBackArtworks(prev => {
          const updated = [...prev];
          if (updated[artworkIndex]) {
            updated[artworkIndex] = {
              ...updated[artworkIndex],
              url: `http://localhost:3001${asset.file_url}`,
              assetId: asset.id
            };
          }
          return updated;
        });
      }).catch(err => console.error('Upload failed:', err));
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    let mockupUrl: string | undefined;
    try {
      if (canvasRef.current?.captureImage) {
        mockupUrl = canvasRef.current.captureImage() || undefined;
      }
    } catch (error) {
      console.error('Error capturing mockup:', error);
    }

    const cartItem = {
      id: `hoodie-${selectedSize}-${Date.now()}`,
      variantId: `hoodie-${selectedSize}`,
      productTitle: 'Classic Hoodie',
      variantColor: HOODIE_COLOR,
      variantSize: selectedSize,
      quantity,
      unitPrice: unitCost,
      customization: {
        method: 'dtg',
        frontArtworks,
        backArtworks,
        neckArtwork,
      },
      mockupUrl,
    };

    addItem(cartItem);
    navigate('/cart');
  };

  const handleDownloadDesign = () => {
    if (canvasRef.current && canvasRef.current.downloadImage) {
      canvasRef.current.downloadImage();
    }
  };

  const handleSaveDesign = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

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

    setShowSaveModal(true);
  };

  const performSaveDesign = async (designName: string) => {
    try {
      const designData = {
        front: frontArtworks.map(a => a.position),
        back: backArtworks.map(a => a.position),
        neck: neckArtwork ? [neckArtwork.position] : [],
        selectedColor: HOODIE_COLOR,
        selectedSize: selectedSize
      };

      const artworkIds: string[] = [
        ...frontArtworks.filter(a => a.assetId).map(a => a.assetId!),
        ...backArtworks.filter(a => a.assetId).map(a => a.assetId!),
        ...(neckArtwork?.assetId ? [neckArtwork.assetId] : [])
      ];

      let thumbnailUrl = '';
      if (canvasRef.current?.getThumbnailBlob) {
        try {
          const thumbnailBlob = await canvasRef.current.getThumbnailBlob();
          if (thumbnailBlob) {
            const thumbnailFile = new File([thumbnailBlob], 'thumbnail.png', { type: 'image/png' });
            const uploadedAsset = await uploadAPI.uploadFile(thumbnailFile);
            thumbnailUrl = uploadedAsset.file_url;
          }
        } catch (err) {
          console.error('Failed to capture thumbnail:', err);
        }
      }

      if (loadedDesignId) {
        await designAPI.update(loadedDesignId, {
          name: designName,
          variantId: HOODIE_VARIANT_IDS[selectedSize],
          designData,
          artworkIds,
          thumbnailUrl
        });
        setSavedDesignName(designName);
      } else {
        const saved = await designAPI.save({
          name: designName,
          productId: HOODIE_PRODUCT_ID,
          variantId: HOODIE_VARIANT_IDS[selectedSize],
          designData,
          artworkIds,
          thumbnailUrl
        });
        setLoadedDesignId(saved.id);
        setSavedDesignName(designName);
      }

      setShowSaveModal(false);
      setToastMessage(loadedDesignId ? 'Design updated successfully!' : 'Design saved successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error saving design:', error);
      throw error;
    }
  };


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

  const loadDesign = async (designId: string) => {
    try {
      const design = await designAPI.getById(designId);
      setLoadedDesignId(design.id);
      setSavedDesignName(design.name);

      const allArtworkIds = design.artwork_ids || [];
      const artworkUrls = design.artwork_urls || {};

      const getFullUrl = (url: string): string => {
        if (!url || url.startsWith('http')) return url;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        return `${API_URL}${url}`;
      };

      let artworkIndex = 0;

      if (design.design_data) {
        if (design.design_data.front?.length > 0) {
          const frontArtworkData: Artwork[] = design.design_data.front.map((pos: ArtworkPosition) => {
            const assetId = allArtworkIds[artworkIndex];
            const url = assetId ? getFullUrl(artworkUrls[assetId]) : '';
            artworkIndex++;
            return { url, position: pos, assetId };
          });
          setFrontArtworks(frontArtworkData);
        }

        if (design.design_data.back?.length > 0) {
          const backArtworkData: Artwork[] = design.design_data.back.map((pos: ArtworkPosition) => {
            const assetId = allArtworkIds[artworkIndex];
            const url = assetId ? getFullUrl(artworkUrls[assetId]) : '';
            artworkIndex++;
            return { url, position: pos, assetId };
          });
          setBackArtworks(backArtworkData);
        }

        if (design.design_data.neck?.length > 0) {
          const assetId = allArtworkIds[artworkIndex];
          const url = assetId ? getFullUrl(artworkUrls[assetId]) : '';
          setNeckArtwork({
            url,
            position: design.design_data.neck[0],
            assetId
          });
        }

        if (design.design_data.selectedSize) {
          setSelectedSize(design.design_data.selectedSize);
        }
      }
    } catch (error) {
      console.error('Error loading design:', error);
    }
  };

  useEffect(() => {
    const designId = searchParams.get('designId');
    if (designId && isAuthenticated) {
      loadDesign(designId);
    }
  }, [searchParams, isAuthenticated]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="relative px-6 py-1.5 flex items-center">
          <h1 className="text-sm font-bold">Classic Hoodie</h1>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-lg font-bold hover:text-gray-600 transition-colors">
            Raspberry
          </Link>

          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={handleDownloadDesign}
              disabled={frontArtworks.length === 0 && backArtworks.length === 0 && !neckArtwork}
              title="Download Design"
              className={`p-2 rounded-md transition-colors ${
                (frontArtworks.length > 0 || backArtworks.length > 0 || neckArtwork)
                  ? 'hover:bg-gray-100'
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ArrowDownToLine size={16} />
            </button>
            <button
              onClick={handleSaveDesign}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md transition-colors bg-black text-white hover:bg-gray-800"
            >
              <Save size={14} />
              {loadedDesignId ? 'Update Design' : 'Save Design'}
            </button>
            <div className="text-sm font-normal">
              from ${BASE_PRICE.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] h-[calc(100vh-40px)]">
        {/* Canvas Area */}
        <div className="bg-white flex flex-col relative h-full overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pt-2 pb-16 px-6">
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
                  setFrontArtworks(frontArtworks.filter((_, i) => i !== index));
                } else if (view === 'neck') {
                  setNeckArtwork(null);
                } else if (view === 'back') {
                  setBackArtworks(backArtworks.filter((_, i) => i !== index));
                }
              }}
            />
          </div>

          {/* View Switcher */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg px-2 py-2 flex gap-1">
            <button
              onClick={() => setView('front')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'front' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setView('back')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'back' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Back
            </button>
            <button
              onClick={() => setView('neck')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'neck' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Neck
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-5 space-y-1">


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
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center hover:border-gray-300 transition-colors cursor-pointer" onClick={() => setView('front')}>
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
                        <p className="text-xs text-gray-600 font-medium">Upload front artwork (up to 4)</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG or PDF</p>
                      </label>
                    </div>
                  )}

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
                          onClick={() => setFrontArtworks(frontArtworks.filter((_, i) => i !== index))}
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
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center hover:border-gray-300 transition-colors cursor-pointer" onClick={() => setView('back')}>
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
                        <p className="text-xs text-gray-600 font-medium">Upload back artwork (up to 4)</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG or PDF</p>
                      </label>
                    </div>
                  )}

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
                          onClick={() => setBackArtworks(backArtworks.filter((_, i) => i !== index))}
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
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center hover:border-gray-300 transition-colors cursor-pointer" onClick={() => setView('neck')}>
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
                        <p className="text-xs text-gray-600 font-medium">Upload neck label</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG or PDF</p>
                      </label>
                    </div>
                  )}

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
                {SIZES.map((size) => (
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

            {/* Quantity, Price */}
            <div className="border-t border-gray-200 pt-5 pb-4">
              <div className={`grid ${quantity >= 2 ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
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
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add to Cart
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

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
