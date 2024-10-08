'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const operators = ['AND', 'OR', 'NOT'];
const conditions = ['equals', 'not equals', 'greater than', 'less than', 'contains'];
const actions = ['activate', 'deactivate', 'upgrade', 'downgrade'];

export function RulesEngine() {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    name: '',
    conditions: [{ field: '', operator: '', value: '' }],
    action: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const { data, error } = await supabase.from('license_rules').select('*');
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setRules(data.map(rule => ({
        ...rule,
        conditions: JSON.parse(rule.condition)
      })));
    }
  };

  const addRule = async () => {
    const { data, error } = await supabase.from('license_rules').insert([{
      name: newRule.name,
      condition: JSON.stringify(newRule.conditions),
      action: newRule.action
    }]);
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Rule added successfully' });
      fetchRules();
      setNewRule({ name: '', conditions: [{ field: '', operator: '', value: '' }], action: '' });
    }
  };

  const deleteRule = async (id) => {
    const { error } = await supabase.from('license_rules').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Rule deleted successfully' });
      fetchRules();
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(newRule.conditions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNewRule({ ...newRule, conditions: items });
  };

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add New Rule</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add New Rule</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="conditions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {newRule.conditions.map((condition, index) => (
                      <Draggable key={index} draggableId={`condition-${index}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="grid grid-cols-5 items-center gap-2 mb-2"
                          >
                            {index > 0 && (
                              <Select
                                value={condition.logicalOperator}
                                onValueChange={(value) => {
                                  const newConditions = [...newRule.conditions];
                                  newConditions[index].logicalOperator = value;
                                  setNewRule({ ...newRule, conditions: newConditions });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  {operators.map((op) => (
                                    <SelectItem key={op} value={op}>
                                      {op}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <Input
                              placeholder="Field"
                              value={condition.field}
                              onChange={(e) => {
                                const newConditions = [...newRule.conditions];
                                newConditions[index].field = e.target.value;
                                setNewRule({ ...newRule, conditions: newConditions });
                              }}
                            />
                            <Select
                              value={condition.operator}
                              onValueChange={(value) => {
                                const newConditions = [...newRule.conditions];
                                newConditions[index].operator = value;
                                setNewRule({ ...newRule, conditions: newConditions });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Condition" />
                              </SelectTrigger>
                              <SelectContent>
                                {conditions.map((cond) => (
                                  <SelectItem key={cond} value={cond}>
                                    {cond}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Value"
                              value={condition.value}
                              onChange={(e) => {
                                const newConditions = [...newRule.conditions];
                                newConditions[index].value = e.target.value;
                                setNewRule({ ...newRule, conditions: newConditions });
                              }}
                            />
                            <Button
                              variant="destructive"
                              onClick={() => {
                                const newConditions = newRule.conditions.filter((_, i) => i !== index);
                                setNewRule({ ...newRule, conditions: newConditions });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button
              onClick={() => setNewRule({
                ...newRule,
                conditions: [...newRule.conditions, { field: '', operator: '', value: '' }]
              })}
            >
              Add Condition
            </Button>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action" className="text-right">
                Action
              </Label>
              <Select
                value={newRule.action}
                onValueChange={(value) => setNewRule({ ...newRule, action: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addRule}>Add Rule</Button>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Conditions</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell>{rule.name}</TableCell>
              <TableCell>{JSON.stringify(rule.conditions)}</TableCell>
              <TableCell>{rule.action}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => deleteRule(rule.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}