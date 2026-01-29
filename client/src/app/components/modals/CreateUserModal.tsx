"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createForm: any;
  setCreateForm: (v: any) => void;
  isSaving: boolean;
  onCreate: () => Promise<void>;
}

export default function CreateUserModal({ open, onOpenChange, createForm, setCreateForm, isSaving, onCreate }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-sm" style={{ backgroundColor: 'rgba(8,8,10,0.98)' }}>
        <DialogHeader>
          <DialogTitle className="font-display">Create New User</DialogTitle>
          <DialogDescription>Add a new user to the platform</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input
              placeholder="John Doe"
              value={createForm.displayName}
              onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              placeholder="johndoe"
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select
              value={createForm.role}
              onValueChange={(value) => setCreateForm({ ...createForm, role: value })}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border border-zinc-700">
                <SelectItem value="user" className="bg-zinc-800 text-white">User</SelectItem>
                <SelectItem value="admin" className="bg-blue-600 text-white">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onCreate}
            disabled={!createForm.email || isSaving}
            className="gradient-bg-primary"
          >
            {isSaving ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
