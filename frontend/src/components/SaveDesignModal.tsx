import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  isUpdating?: boolean;
  currentName?: string;
}

export default function SaveDesignModal({
  isOpen,
  onClose,
  onSave,
  isUpdating = false,
  currentName = ''
}: SaveDesignModalProps) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for your design');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave(name.trim());
      setSaved(true);

      // Auto-close after 1.5 seconds on success
      setTimeout(() => {
        onClose();
        setSaved(false);
        setName('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save design');
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
      setName('');
      setError('');
      setSaved(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">
            {isUpdating ? 'Update Design' : 'Save Design'}
          </h2>
          {!saving && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {saved ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isUpdating ? 'Design Updated!' : 'Design Saved!'}
              </h3>
              <p className="text-gray-600">
                Your design "{name}" has been saved to your dashboard
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label htmlFor="design-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Design Name
                </label>
                <input
                  id="design-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="e.g., Summer Collection Tee"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  disabled={saving}
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  💡 <strong>Tip:</strong> Give your design a memorable name so you can easily find it later!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={saving}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </span>
              ) : (
                isUpdating ? 'Update Design' : 'Save Design'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
