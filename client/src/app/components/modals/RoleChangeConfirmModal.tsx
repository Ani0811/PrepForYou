"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingRoleChange: string | null;
  setPendingRoleChange: (v: string | null) => void;
  selectedUser: any;
  setEditForm: (v: any) => void;
  editForm: any;
}

export default function RoleChangeConfirmModal({ open, onOpenChange, pendingRoleChange, setPendingRoleChange, selectedUser, setEditForm, editForm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md fixed top-[55%]! border border-border shadow-2xl z-[100] overflow-hidden p-0 backdrop-blur-sm"
        style={{ backgroundColor: 'oklch(var(--background))' }}
      >
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-amber-500/10 dark:bg-amber-500/20">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="font-display font-bold text-2xl text-foreground">Confirm Role Change</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground leading-relaxed mt-1">
            Are you sure you want to change this user's role from <span className="font-bold text-foreground capitalize">{selectedUser?.role}</span> to <span className="font-bold text-violet-600 dark:text-violet-400 capitalize">{pendingRoleChange}</span>?
          </DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-accent/5">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={selectedUser.avatarUrl || undefined} />
                <AvatarFallback className="gradient-bg-primary text-white font-bold">{selectedUser.displayName ? selectedUser.displayName.split(' ').map((n: string) => (n[0] ?? '')).join('').toUpperCase().slice(0, 2) : 'U'}</AvatarFallback>
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
            onClick={() => { onOpenChange(false); setPendingRoleChange(null); }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (pendingRoleChange) {
                setEditForm({ ...editForm, role: pendingRoleChange });
              }
              onOpenChange(false);
              setPendingRoleChange(null);
            }}
            className="gradient-bg-primary shadow-lg shadow-primary/20"
          >
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
