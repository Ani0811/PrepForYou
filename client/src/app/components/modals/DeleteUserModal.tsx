"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
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
      <DialogContent
        className="sm:max-w-md fixed top-[55%]! border border-border shadow-2xl z-60 overflow-hidden p-0"
        style={{ backgroundColor: 'oklch(var(--background))' }}
      >
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-red-500/10 dark:bg-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="font-display font-bold text-2xl text-red-500">Delete User</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground leading-relaxed mt-1">
            Are you sure you want to delete this user? This action will deactivate their account.
          </DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-accent/5">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={selectedUser.avatarUrl || undefined} />
                <AvatarFallback className="gradient-bg-primary text-white font-bold">
                  {getInitials(selectedUser.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg leading-none mb-1 text-foreground">{selectedUser.displayName || 'No name'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
          </div>
        )}
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
            variant="destructive"
            onClick={onDelete}
            disabled={isSaving}
            className="shadow-lg shadow-destructive/20"
          >
            {isSaving ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
