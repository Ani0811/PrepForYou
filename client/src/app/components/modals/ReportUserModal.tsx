"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: any;
  reportForm: any;
  setReportForm: (v: any) => void;
  onSubmit: () => Promise<void>;
  isSaving: boolean;
  getInitials: (s: string | null) => string;
}

export default function ReportUserModal({ open, onOpenChange, selectedUser, reportForm, setReportForm, onSubmit, isSaving, getInitials }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md fixed top-[55%]! border border-border shadow-2xl z-[60] overflow-hidden p-0"
        style={{ backgroundColor: 'oklch(var(--background))' }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display font-bold gradient-text text-2xl">Report User</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">Submit a report about this user</DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-accent/5">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.avatarUrl || undefined} />
                <AvatarFallback className="gradient-bg-primary text-white font-bold">{getInitials(selectedUser.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-foreground">{selectedUser.displayName || 'No name'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Reason *</label>
              <Select
                value={reportForm.reason}
                onValueChange={(value) => setReportForm({ ...reportForm, reason: value })}
                disabled={isSaving}
              >
                <SelectTrigger className="bg-accent/5 border-border">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent
                  className="border-border z-[70]! opacity-100! shadow-2xl"
                  style={{ backgroundColor: 'oklch(var(--background))', color: 'oklch(var(--foreground))' }}
                >
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="impersonation">Impersonation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Details</label>
              <Input
                placeholder="Additional information..."
                value={reportForm.details}
                className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
                onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                disabled={isSaving}
              />
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
            onClick={onSubmit}
            disabled={!reportForm.reason || isSaving}
            className="gradient-bg-primary shadow-lg shadow-primary/20"
          >
            {isSaving ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
