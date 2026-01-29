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
      <DialogContent className="sm:max-w-md backdrop-blur-sm" style={{ backgroundColor: 'rgba(8,8,10,0.98)' }}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle className="font-display">Confirm Role Change</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to change this user's role to <span className="font-semibold text-primary">{pendingRoleChange}</span>?
          </DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.avatarUrl || undefined} />
                <AvatarFallback className="gradient-bg-primary text-primary-foreground">{selectedUser.displayName ? selectedUser.displayName.split(' ').map((n: string) => (n[0] ?? '')).join('').toUpperCase().slice(0,2) : 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser.displayName || 'No name'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Current role: <span className="font-semibold">{selectedUser.role}</span></p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
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
            className="gradient-bg-primary"
          >
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
