import { z } from 'zod';

export const licenseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  status: z.string().min(1, 'Status is required'),
  key: z.string().min(1, 'License key is required'),
  offline_key: z.string().optional(),
  expiration_date: z.string().optional(),
  max_uses: z.number().int().nonnegative().optional(),
  current_uses: z.number().int().nonnegative().optional(),
  features: z.array(z.string()).optional(),
  capacity: z.number().int().nonnegative().optional(),
  tokens: z.number().int().nonnegative().optional(),
});

export const ruleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  condition: z.string().min(1, 'Condition is required'),
  action: z.string().min(1, 'Action is required'),
});

export type License = z.infer<typeof licenseSchema>;
export type Rule = z.infer<typeof ruleSchema>;