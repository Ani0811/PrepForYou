"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Lock } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: any;
  setEditForm: (v: any) => void;
  selectedUser: any;
  currentUserRole: string | null;
  pendingRoleChange: string | null;
  setPendingRoleChange: (v: string | null) => void;
  setIsRoleChangeConfirmOpen: (v: boolean) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export default function EditUserModal({ open, onOpenChange, editForm, setEditForm, selectedUser, currentUserRole, pendingRoleChange, setPendingRoleChange, setIsRoleChangeConfirmOpen, onSave, isSaving }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md fixed top-[55%]! border border-border shadow-2xl z-[60] overflow-hidden p-0"
        style={{ backgroundColor: 'oklch(var(--background))' }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display font-bold gradient-text text-2xl">Edit User</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">Update user information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Display Name</label>
            <Input
              value={editForm.displayName}
              className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              value={editForm.username}
              className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={editForm.email}
              className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground opacity-80">Role Management</label>
            {selectedUser && selectedUser.role === 'owner' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 dark:text-amber-400 w-fit">
                <Lock className="h-4 w-4" />
                <span className="font-bold">System Owner</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (currentUserRole !== 'owner') return;
                    if (selectedUser?.role === 'user' && !pendingRoleChange) return;
                    setPendingRoleChange('user');
                    setIsRoleChangeConfirmOpen(true);
                  }}
                  disabled={currentUserRole !== 'owner'}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 shadow-sm border-2 ${((pendingRoleChange ?? editForm.role) === 'user') ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 scale-[1.02]' : 'bg-accent/5 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 border-border opacity-60'}`}
                >
                  User Role
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentUserRole !== 'owner') return;
                    if (selectedUser?.role === 'admin' && !pendingRoleChange) return;
                    setPendingRoleChange('admin');
                    setIsRoleChangeConfirmOpen(true);
                  }}
                  disabled={currentUserRole !== 'owner'}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 shadow-sm border-2 ${((pendingRoleChange ?? editForm.role) === 'admin') ? 'gradient-bg-primary text-white border-transparent scale-[1.02]' : 'bg-accent/5 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 border-border opacity-60'}`}
                >
                  Admin Role
                </button>
              </div>
            )}
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
            onClick={onSave}
            disabled={isSaving}
            className="gradient-bg-primary shadow-lg shadow-primary/20"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
