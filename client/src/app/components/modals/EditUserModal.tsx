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
      <DialogContent className="sm:max-w-md backdrop-blur-sm" style={{ backgroundColor: 'rgba(8,8,10,0.98)' }}>
        <DialogHeader>
          <DialogTitle className="font-display">Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            {selectedUser && selectedUser.role === 'owner' ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-amber-500/20 text-sm text-amber-400 w-fit">
                <Lock className="h-4 w-4 text-amber-400" />
                <span className="font-medium">Owner</span>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentUserRole !== 'owner') return;
                    if (selectedUser?.role === 'user') return; // no change
                    setPendingRoleChange('user');
                    setIsRoleChangeConfirmOpen(true);
                  }}
                  disabled={currentUserRole !== 'owner'}
                  aria-disabled={currentUserRole !== 'owner'}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${((pendingRoleChange ?? editForm.role) === 'user') ? 'ring-2 ring-amber-400 bg-zinc-800 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                >
                  User
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentUserRole !== 'owner') return;
                    if (selectedUser?.role === 'admin') return;
                    setPendingRoleChange('admin');
                    setIsRoleChangeConfirmOpen(true);
                  }}
                  disabled={currentUserRole !== 'owner'}
                  aria-disabled={currentUserRole !== 'owner'}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${((pendingRoleChange ?? editForm.role) === 'admin') ? 'ring-2 ring-blue-400 bg-blue-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                >
                  Admin
                </button>
              </div>
            )}
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
            onClick={onSave}
            disabled={isSaving}
            className="gradient-bg-primary"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
