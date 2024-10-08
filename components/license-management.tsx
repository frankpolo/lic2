'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { licenseSchema, License } from '@/lib/validation';

// ... (previous imports and constants)

export function LicenseManagement() {
  // ... (previous state declarations)

  useEffect(() => {
    fetchLicenses();
    fetchFeatures();

    const licenseSubscription = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'licenses' },
        (payload) => {
          console.log('Change received!', payload);
          fetchLicenses();
        }
      )
      .subscribe();

    return () => {
      licenseSubscription.unsubscribe();
    };
  }, []);

  // ... (rest of the component remains the same)
}