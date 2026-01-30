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
      <DialogContent
        className="sm:max-w-md fixed top-[55%]! border border-border shadow-2xl z-[60] overflow-hidden p-0"
        style={{ backgroundColor: 'oklch(var(--background))' }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display font-bold gradient-text text-2xl">Create New User</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">Add a new user to the platform</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Display Name</label>
            <Input
              placeholder="John Doe"
              value={createForm.displayName}
              className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
              onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              placeholder="johndoe"
              value={createForm.username}
              className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email *</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={createForm.email}
              className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground opacity-80">Assign Role</label>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => setCreateForm({ ...createForm, role: 'user' })}
                disabled={isSaving}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 shadow-sm border-2 ${createForm.role === 'user' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 scale-[1.02]' : 'bg-accent/5 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 border-border opacity-60'}`}
              >
                User Role
              </button>

              <button
                type="button"
                onClick={() => setCreateForm({ ...createForm, role: 'admin' })}
                disabled={isSaving}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 shadow-sm border-2 ${createForm.role === 'admin' ? 'gradient-bg-primary text-white border-transparent scale-[1.02]' : 'bg-accent/5 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 border-border opacity-60'}`}
              >
                Admin Role
              </button>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 border-t border-border p-4 bg-background/50">
          <Button
            variant="outline"
            className="hover:bg-accent"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onCreate}
            disabled={!createForm.email || isSaving}
            className="gradient-bg-primary shadow-lg shadow-primary/20"
          >
            {isSaving ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
