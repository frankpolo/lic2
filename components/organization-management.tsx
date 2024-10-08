'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState([
    { id: 1, name: 'Org A', type: 'Enterprise', licenses: 5 },
    { id: 2, name: 'Org B', type: 'SMB', licenses: 2 },
  ]);
  const [newOrg, setNewOrg] = useState({ name: '', type: '', licenses: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const addOrganization = () => {
    if (newOrg.name && newOrg.type && newOrg.licenses) {
      setOrganizations([...organizations, { ...newOrg, id: organizations.length + 1 }]);
      setNewOrg({ name: '', type: '', licenses: 0 });
    }
  };

  const deleteOrganization = (id: number) => {
    setOrganizations(organizations.filter(org => org.id !== id));
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          className="max-w-sm"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Organization</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Organization</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select onValueChange={(value) => setNewOrg({ ...newOrg, type: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                    <SelectItem value="SMB">SMB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="licenses" className="text-right">
                  Licenses
                </Label>
                <Input
                  id="licenses"
                  type="number"
                  value={newOrg.licenses}
                  onChange={(e) => setNewOrg({ ...newOrg, licenses: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={addOrganization}>Add Organization</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Licenses</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrganizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>{org.id}</TableCell>
              <TableCell>{org.name}</TableCell>
              <TableCell>{org.type}</TableCell>
              <TableCell>{org.licenses}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => deleteOrganization(org.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}