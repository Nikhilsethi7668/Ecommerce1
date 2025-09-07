"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function AlertModal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
}) {
  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {onCancel && (
            <Button variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
