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
      <DialogContent className="sm:max-w-md backdrop-blur-sm" style={{ backgroundColor: 'rgba(8,8,10,0.98)' }}>
        <DialogHeader>
          <DialogTitle className="font-display">Report User</DialogTitle>
          <DialogDescription>Submit a report about this user</DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.avatarUrl || undefined} />
                <AvatarFallback className="gradient-bg-primary text-primary-foreground">{getInitials(selectedUser.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser.displayName || 'No name'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason *</label>
              <Select
                value={reportForm.reason}
                onValueChange={(value) => setReportForm({ ...reportForm, reason: value })}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border border-zinc-700">
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="impersonation">Impersonation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Details</label>
              <Input
                placeholder="Additional information..."
                value={reportForm.details}
                onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                disabled={isSaving}
              />
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
            onClick={onSubmit}
            disabled={!reportForm.reason || isSaving}
            className="gradient-bg-primary"
          >
            {isSaving ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
