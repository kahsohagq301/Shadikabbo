import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "destructive" | "default";
  children?: React.ReactNode;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to delete this item?",
  confirmText = "Yes",
  cancelText = "No",
  isLoading = false,
  variant = "destructive",
  children,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-confirmation">
        <DialogHeader>
          <DialogTitle data-testid="text-confirmation-title">{title}</DialogTitle>
          <DialogDescription data-testid="text-confirmation-description">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children && (
          <div className="py-4">
            {children}
          </div>
        )}
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            data-testid="button-confirmation-cancel"
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
            data-testid="button-confirmation-confirm"
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier usage
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const showConfirmation = (action: () => void) => {
    setPendingAction(() => action);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
    setIsOpen(false);
    setPendingAction(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setPendingAction(null);
  };

  return {
    isOpen,
    showConfirmation,
    handleConfirm,
    handleCancel,
  };
}