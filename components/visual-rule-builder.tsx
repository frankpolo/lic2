'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const conditions = ['equals', 'not equals', 'greater than', 'less than', 'contains'];
const actions = ['activate', 'deactivate', 'upgrade', 'downgrade'];

export function VisualRuleBuilder() {
  const [rule, setRule] = useState({
    name: '',
    condition: {
      field: '',
      operator: '',
      value: '',
    },
    action: '',
  });

  const saveRule = async () => {
    const { data, error } = await supabase
      .from('license_rules')
      .insert([{
        name: rule.name,
        condition: JSON.stringify(rule.condition),
        action: rule.action,
      }]);

    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Rule saved successfully' });
      setRule({
        name: '',
        condition: {
          field: '',
          operator: '',
          value: '',
        },
        action: '',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Rule Name"
        value={rule.name}
        onChange={(e) => setRule({ ...rule, name: e.target.value })}
      />
      <div className="flex space-x-2">
        <Input
          placeholder="Field"
          value={rule.condition.field}
          onChange={(e) => setRule({ ...rule, condition: { ...rule.condition, field: e.target.value } })}
        />
        <Select
          value={rule.condition.operator}
          onValueChange={(value) => setRule({ ...rule, condition: { ...rule.condition, operator: value } })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((condition) => (
              <SelectItem key={condition} value={condition}>
                {condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Value"
          value={rule.condition.value}
          onChange={(e) => setRule({ ...rule, condition: { ...rule.condition, value: e.target.value } })}
        />
      </div>
      <Select
        value={rule.action}
        onValueChange={(value) => setRule({ ...rule, action: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          {actions.map((action) => (
            <SelectItem key={action} value={action}>
              {action}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={saveRule}>Save Rule</Button>
    </div>
  );
}