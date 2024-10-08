'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export function OfflineActivation() {
  const [offlineKey, setOfflineKey] = useState('');
  const [activationCode, setActivationCode] = useState('');

  const generateActivationCode = async () => {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('offline_key', offlineKey)
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Invalid offline key' });
    } else {
      // Generate a unique activation code based on the license data
      const code = btoa(JSON.stringify({
        id: data.id,
        key: data.key,
        expiration_date: data.expiration_date,
        features: data.features
      }));
      setActivationCode(code);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter offline key"
        value={offlineKey}
        onChange={(e) => setOfflineKey(e.target.value)}
      />
      <Button onClick={generateActivationCode}>Generate Activation Code</Button>
      {activationCode && (
        <div>
          <h3 className="font-bold">Activation Code:</h3>
          <p className="break-all">{activationCode}</p>
        </div>
      )}
    </div>
  );
}