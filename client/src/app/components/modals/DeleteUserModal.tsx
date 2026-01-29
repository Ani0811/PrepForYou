"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: any;
  onDelete: () => Promise<void>;
  isSaving: boolean;
  getInitials: (s: string | null) => string;
}

export default function DeleteUserModal({ open, onOpenChange, selectedUser, onDelete, isSaving, getInitials }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-sm" style={{ backgroundColor: 'rgba(8,8,10,0.98)' }}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <DialogTitle className="font-display text-red-500">Delete User</DialogTitle>
          </div>
          <div>Are you sure you want to delete this user? This action will deactivate their account.</div>
        </DialogHeader>
        {selectedUser && (
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.avatarUrl || undefined} />
                <AvatarFallback className="gradient-bg-primary text-primary-foreground">
                  {getInitials(selectedUser.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser.displayName || 'No name'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSaving ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
