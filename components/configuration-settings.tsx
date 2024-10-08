'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

export function ConfigurationSettings() {
  const [offlineMode, setOfflineMode] = useState(false);
  const [aiOptimization, setAiOptimization] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const saveConfiguration = () => {
    // Here you would typically save these settings to a backend
    console.log('Saving configuration:', { offlineMode, aiOptimization, apiKey });
    toast({
      title: "Configuration Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <Input 
          id="api-key" 
          placeholder="Enter your API key" 
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="offline-mode" 
          checked={offlineMode} 
          onCheckedChange={setOfflineMode} 
        />
        <Label htmlFor="offline-mode">Enable Offline Mode</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="ai-optimization" 
          checked={aiOptimization} 
          onCheckedChange={setAiOptimization}
        />
        <Label htmlFor="ai-optimization">Enable AI-powered Optimization</Label>
      </div>
      <Button onClick={saveConfiguration}>Save Configuration</Button>
    </div>
  );
}