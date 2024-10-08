-- Create licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  offline_key TEXT,
  expiration_date TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  features JSONB,
  capacity INTEGER,
  tokens INTEGER,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create features table
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_features table
CREATE TABLE product_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
  UNIQUE(product_id, feature_id)
);

-- Create custom_attributes table
CREATE TABLE custom_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Create product_custom_attributes table
CREATE TABLE product_custom_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  attribute_id UUID REFERENCES custom_attributes(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, attribute_id)
);

-- Create license_rules table
CREATE TABLE license_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  condition TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_logs table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
  usage_amount INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add full-text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX product_custom_attributes_value_trgm_idx ON product_custom_attributes USING GIN (value gin_trgm_ops);
CREATE INDEX custom_attributes_name_trgm_idx ON custom_attributes USING GIN (name gin_trgm_ops);

-- Function to search products by custom attributes
CREATE OR REPLACE FUNCTION search_products_by_attributes(search_query TEXT)
RETURNS TABLE (product_id UUID, relevance FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (p.id) p.id, similarity(pca.value, search_query) as relevance
  FROM products p
  JOIN product_custom_attributes pca ON p.id = pca.product_id
  JOIN custom_attributes ca ON pca.attribute_id = ca.id
  WHERE pca.value ILIKE '%' || search_query || '%'
     OR ca.name ILIKE '%' || search_query || '%'
  ORDER BY p.id, relevance DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check and update license status
CREATE OR REPLACE FUNCTION check_license_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiration_date < NOW() THEN
    NEW.status = 'Expired';
  ELSIF NEW.max_uses IS NOT NULL AND NEW.current_uses >= NEW.max_uses THEN
    NEW.status = 'Exhausted';
  ELSE
    NEW.status = 'Active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_license_status
BEFORE INSERT OR UPDATE ON licenses
FOR EACH ROW EXECUTE FUNCTION check_license_status();