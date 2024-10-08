'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export function LicenseTransferPooling() {
  const [licenses, setLicenses] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedLicense, setSelectedLicense] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');

  useEffect(() => {
    fetchLicenses();
    fetchOrganizations();
  }, []);

  const fetchLicenses = async () => {
    const { data, error } = await supabase.from('licenses').select('*');
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setLicenses(data);
    }
  };

  const fetchOrganizations = async () => {
    const { data, error } = await supabase.from('organizations').select('*');
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setOrganizations(data);
    }
  };

  const transferLicense = async () => {
    const { data, error } = await supabase
      .from('licenses')
      .update({ organization_id: selectedOrganization })
      .eq('id', selectedLicense);

    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'License transferred successfully' });
      fetchLicenses();
    }
  };

  return (
    <div className="space-y-4">
      <Select
        value={selectedLicense}
        onValueChange={setSelectedLicense}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select License" />
        </SelectTrigger>
        <SelectContent>
          {licenses.map((license) => (
            <SelectItem key={license.id} value={license.id}>
              {license.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedOrganization}
        onValueChange={setSelectedOrganization}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={transferLicense}>Transfer License</Button>
    </div>
  );
}