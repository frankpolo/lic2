'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LicenseManagement } from '@/components/license-management';
import { ProductFeatureManagement } from '@/components/product-feature-management';
import { OrganizationManagement } from '@/components/organization-management';
import { ReportingAnalytics } from '@/components/reporting-analytics';
import { ConfigurationSettings } from '@/components/configuration-settings';
import { UserManagement } from '@/components/user-management';
import { RulesEngine } from '@/components/rules-engine';
import { OfflineActivation } from '@/components/offline-activation';
import { VisualRuleBuilder } from '@/components/visual-rule-builder';
import { LicenseTransferPooling } from '@/components/license-transfer-pooling';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('licenses');

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>License Management System Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="products">Products & Features</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="rules">Rules Engine</TabsTrigger>
            <TabsTrigger value="reporting">Reporting & Analytics</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="offline">Offline Activation</TabsTrigger>
            <TabsTrigger value="visual-rules">Visual Rule Builder</TabsTrigger>
            <TabsTrigger value="transfer">License Transfer & Pooling</TabsTrigger>
          </TabsList>
          <TabsContent value="licenses">
            <LicenseManagement />
          </TabsContent>
          <TabsContent value="products">
            <ProductFeatureManagement />
          </TabsContent>
          <TabsContent value="organizations">
            <OrganizationManagement />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="rules">
            <RulesEngine />
          </TabsContent>
          <TabsContent value="reporting">
            <ReportingAnalytics />
          </TabsContent>
          <TabsContent value="configuration">
            <ConfigurationSettings />
          </TabsContent>
          <TabsContent value="offline">
            <OfflineActivation />
          </TabsContent>
          <TabsContent value="visual-rules">
            <VisualRuleBuilder />
          </TabsContent>
          <TabsContent value="transfer">
            <LicenseTransferPooling />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}