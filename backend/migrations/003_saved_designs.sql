-- Saved Designs table for users to save their custom designs
-- Users can save their t-shirt designs with all artwork and positioning data

CREATE TABLE saved_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Design info
  name VARCHAR(255) NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES variants(id), -- Selected variant (color/size) if any

  -- Design data (canvas state)
  design_data JSONB NOT NULL, -- Contains all artwork positions, rotations, sizes per view
  -- Example structure:
  -- {
  --   "front": [{ "artworkId": "uuid", "x": 100, "y": 150, "width": 200, "height": 200, "rotation": 0 }],
  --   "back": [],
  --   "neck": [{ "artworkId": "uuid", "x": 50, "y": 75, "width": 100, "height": 100, "rotation": 45 }]
  -- }

  -- Artwork references (array of asset IDs)
  artwork_ids JSONB DEFAULT '[]'::jsonb, -- Array of asset UUIDs

  -- Preview/mockup
  thumbnail_url VARCHAR(500), -- Generated thumbnail for quick preview

  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_saved_designs_user_id ON saved_designs(user_id);
CREATE INDEX idx_saved_designs_product_id ON saved_designs(product_id);
CREATE INDEX idx_saved_designs_created_at ON saved_designs(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_designs_updated_at
  BEFORE UPDATE ON saved_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
