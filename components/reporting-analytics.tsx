'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export function ReportingAnalytics() {
  const [licenseUsage, setLicenseUsage] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);

  useEffect(() => {
    fetchLicenseUsage();
    fetchLicenseTypes();
  }, []);

  const fetchLicenseUsage = async () => {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .order('timestamp', { ascending: true });
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setLicenseUsage(data);
    }
  };

  const fetchLicenseTypes = async () => {
    const { data, error } = await supabase
      .from('licenses')
      .select('type')
      .distinct();
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setLicenseTypes(data.map(item => item.type));
    }
  };

  const aggregateUsageData = () => {
    const aggregated = licenseUsage.reduce((acc, log) => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0 };
      }
      acc[date].total += log.usage_amount;
      return acc;
    }, {});
    return Object.values(aggregated);
  };

  const aggregateLicenseTypes = () => {
    return licenseTypes.map(type => ({
      type,
      count: licenseUsage.filter(log => log.license_type === type).length
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>License Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={aggregateUsageData()}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>License Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={aggregateLicenseTypes()}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}