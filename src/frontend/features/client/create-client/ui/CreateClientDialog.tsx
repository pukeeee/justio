"use client";

import { useState } from "react";
import { useIsMobile } from "@/frontend/shared/hooks/use-mobile";
import { Button } from "@/frontend/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/shared/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/frontend/shared/components/ui/sheet";
import { Plus } from "lucide-react";
import { CreateClientForm } from "./CreateClientForm";

interface CreateClientDialogProps {
  workspaceId: string;
}

export function CreateClientDialog({ workspaceId }: CreateClientDialogProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSuccess = () => {
    setOpen(false);
    // Тут можна додати тост повідомлення
    console.log("Contact created successfully");
  };

  const TriggerButton = (
    <Button className="flex gap-2">
      <Plus className="h-4 w-4" />
      Додати клієнта
    </Button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
        <SheetContent
          side="right"
          className="w-screen max-w-none p-0 flex flex-col h-full border-none sm:max-w-none"
        >
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <SheetTitle>Новий клієнт</SheetTitle>
            <SheetDescription>
              Додайте нового клієнта або компанію до бази.
            </SheetDescription>
          </SheetHeader>
          <CreateClientForm
            workspaceId={workspaceId}
            onSuccess={handleSuccess}
            className="flex-1 min-h-0"
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{TriggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-150 h-[90vh] max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Новий контакт</DialogTitle>
          <DialogDescription>
            Заповніть форму для створення нового контакту. Обов`язкові поля
            позначені зірочкою.
          </DialogDescription>
        </DialogHeader>
        <CreateClientForm
          workspaceId={workspaceId}
          onSuccess={handleSuccess}
          className="flex-1 min-h-0"
        />
      </DialogContent>
    </Dialog>
  );
}
