'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export function ProductFeatureManagement() {
  const [products, setProducts] = useState([]);
  const [features, setFeatures] = useState([]);
  const [customAttributes, setCustomAttributes] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', features: [], customAttributes: {} });
  const [newFeature, setNewFeature] = useState({ name: '', description: '' });
  const [newCustomAttribute, setNewCustomAttribute] = useState({ name: '', type: 'text' });
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkEditProducts, setBulkEditProducts] = useState([]);
  const [bulkEditAttribute, setBulkEditAttribute] = useState({ id: '', value: '' });

  useEffect(() => {
    fetchProducts();
    fetchFeatures();
    fetchCustomAttributes();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_features (
          feature_id
        ),
        product_custom_attributes (
          custom_attributes (
            id,
            name,
            type
          ),
          value
        )
      `);
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setProducts(data.map(product => ({
        ...product,
        features: product.product_features.map(pf => pf.feature_id),
        customAttributes: product.product_custom_attributes.reduce((acc, pca) => {
          acc[pca.custom_attributes.id] = { ...pca.custom_attributes, value: pca.value };
          return acc;
        }, {})
      })));
    }
  };

  const fetchFeatures = async () => {
    const { data, error } = await supabase.from('features').select('*');
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setFeatures(data);
    }
  };

  const fetchCustomAttributes = async () => {
    const { data, error } = await supabase.from('custom_attributes').select('*');
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setCustomAttributes(data);
    }
  };

  const addProduct = async () => {
    const { data, error } = await supabase.from('products').insert([{ name: newProduct.name }]).select();
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      const productId = data[0].id;
      const featureInserts = newProduct.features.map(featureId => ({
        product_id: productId,
        feature_id: featureId
      }));
      const { error: featureError } = await supabase.from('product_features').insert(featureInserts);
      if (featureError) {
        toast({ title: 'Error', description: featureError.message });
      } else {
        const attributeInserts = Object.entries(newProduct.customAttributes).map(([attributeId, value]) => ({
          product_id: productId,
          attribute_id: attributeId,
          value: value
        }));
        const { error: attributeError } = await supabase.from('product_custom_attributes').insert(attributeInserts);
        if (attributeError) {
          toast({ title: 'Error', description: attributeError.message });
        } else {
          toast({ title: 'Success', description: 'Product added successfully' });
          fetchProducts();
          setNewProduct({ name: '', features: [], customAttributes: {} });
        }
      }
    }
  };

  const addFeature = async () => {
    const { error } = await supabase.from('features').insert([newFeature]);
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Feature added successfully' });
      fetchFeatures();
      setNewFeature({ name: '', description: '' });
    }
  };

  const addCustomAttribute = async () => {
    const { error } = await supabase.from('custom_attributes').insert([newCustomAttribute]);
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Custom attribute added successfully' });
      fetchCustomAttributes();
      setNewCustomAttribute({ name: '', type: 'text' });
    }
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Product deleted successfully' });
      fetchProducts();
    }
  };

  const searchProducts = async () => {
    const { data, error } = await supabase.rpc('search_products_by_attributes', { search_query: searchTerm });
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      const productIds = data.map(item => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_features (
            feature_id
          ),
          product_custom_attributes (
            custom_attributes (
              id,
              name,
              type
            ),
            value
          )
        `)
        .in('id', productIds);
      if (productsError) {
        toast({ title: 'Error', description: productsError.message });
      } else {
        setProducts(products.map(product => ({
          ...product,
          features: product.product_features.map(pf => pf.feature_id),
          customAttributes: product.product_custom_attributes.reduce((acc, pca) => {
            acc[pca.custom_attributes.id] = { ...pca.custom_attributes, value: pca.value };
            return acc;
          }, {})
        })));
      }
    }
  };

  const bulkEditAttribute = async () => {
    const updates = bulkEditProducts.map(productId => ({
      product_id: productId,
      attribute_id: bulkEditAttribute.id,
      value: bulkEditAttribute.value
    }));
    const { error } = await supabase.from('product_custom_attributes').upsert(updates);
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Bulk edit completed successfully' });
      fetchProducts();
      setBulkEditProducts([]);
      setBulkEditAttribute({ id: '', value: '' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          className="max-w-sm"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={searchProducts}>Search</Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Features</Label>
                <div className="col-span-3">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`feature-${feature.id}`}
                        checked={newProduct.features.includes(feature.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewProduct({ ...newProduct, features: [...newProduct.features, feature.id] });
                          } else {
                            setNewProduct({ ...newProduct, features: newProduct.features.filter(id => id !== feature.id) });
                          }
                        }}
                      />
                      <Label htmlFor={`feature-${feature.id}`}>{feature.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Custom Attributes</Label>
                <div className="col-span-3">
                  {customAttributes.map((attribute) => (
                    <div key={attribute.id} className="flex items-center space-x-2">
                      <Label htmlFor={`attribute-${attribute.id}`}>{attribute.name}</Label>
                      <Input
                        id={`attribute-${attribute.id}`}
                        value={newProduct.customAttributes[attribute.id] || ''}
                        onChange={(e) => setNewProduct({
                          ...newProduct,
                          customAttributes: {
                            ...newProduct.customAttributes,
                            [attribute.id]: e.target.value
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={addProduct}>Add Product</Button>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Feature</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Feature</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featureName" className="text-right">
                  Name
                </Label>
                <Input
                  id="featureName"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featureDescription" className="text-right">
                  Description
                </Label>
                <Input
                  id="featureDescription"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={addFeature}>Add Feature</Button>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Custom Attribute</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Attribute</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attributeName" className="text-right">
                  Name
                </Label>
                <Input
                  id="attributeName"
                  value={newCustomAttribute.name}
                  onChange={(e) => setNewCustomAttribute({ ...newCustomAttribute, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attributeType" className="text-right">
                  Type
                </Label>
                <Select onValueChange={(value) => setNewCustomAttribute({ ...newCustomAttribute, type: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addCustomAttribute}>Add Custom Attribute</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Features</TableHead>
            {customAttributes.map((attribute) => (
              <TableHead key={attribute.id}>{attribute.name}</TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.features.map(id => features.find(f => f.id === id)?.name).join(', ')}</TableCell>
              {customAttributes.map((attribute) => (
                <TableCell key={attribute.id}>{product.customAttributes[attribute.id]?.value || ''}</TableCell>
              ))}
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bulk Edit Custom Attributes</h3>
        <div className="flex space-x-4">
          <Select onValueChange={(value) => setBulkEditAttribute({ ...bulkEditAttribute, id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select attribute" />
            </SelectTrigger>
            <SelectContent>
              {customAttributes.map((attribute) => (
                <SelectItem key={attribute.id} value={attribute.id}>{attribute.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="New value"
            value={bulkEditAttribute.value}
            onChange={(e) => setBulkEditAttribute({ ...bulkEditAttribute, value: e.target.value })}
          />
          <Button onClick={bulkEditAttribute}>Apply Bulk Edit</Button>
        </div>
        <div>
          {products.map((product) => (
            <div key={product.id} className="flex items-center space-x-2">
              <Checkbox
                id={`bulk-edit-${product.id}`}
                checked={bulkEditProducts.includes(product.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setBulkEditProducts([...bulkEditProducts, product.id]);
                  } else {
                    setBulkEditProducts(bulkEditProducts.filter(id => id !== product.id));
                  }
                }}
              />
              <Label htmlFor={`bulk-edit-${product.id}`}>{product.name}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}