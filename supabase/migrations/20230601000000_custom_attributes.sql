-- Create custom_attributes table
CREATE TABLE custom_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  UNIQUE(name)
);

-- Create product_custom_attributes table
CREATE TABLE product_custom_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  attribute_id UUID REFERENCES custom_attributes(id) ON DELETE CASCADE,
  value TEXT,
  UNIQUE(product_id, attribute_id)
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