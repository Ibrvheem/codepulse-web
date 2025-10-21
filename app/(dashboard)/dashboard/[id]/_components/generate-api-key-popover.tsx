"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Copy, Key } from "lucide-react";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import { useGenerateKey } from "./useGenerateKey";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface GenerateApiKeyPopoverProps {
  projectId: string;
  onKeyGenerated?: () => void;
}

export function GenerateApiKeyPopover({
  projectId,
}: GenerateApiKeyPopoverProps) {
  const {
    form,
    onSubmit,
    open,
    setOpen,
    isSubmitting,
    generatedKey,
    handleClose,
  } = useGenerateKey({
    defaultValues: { projectId },
  });
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-sm"
        >
          <Key className="w-4 h-4 mr-2" />
          Generate New API Key
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        {generatedKey ? (
          // Show generated key
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-green-700">
                API Key Generated!
              </h4>
              <p className="text-xs text-gray-600">
                Copy this key now. You won&apos;t be able to see it again!
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-700">Your API Key</Label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <code className="text-xs font-mono text-gray-900 break-all">
                    {generatedKey}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-xs text-amber-800">
                <strong>Warning:</strong> Store this key securely. It will only
                be shown once.
              </p>
            </div>
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : (
          // Show form to generate key
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Generate API Key</h4>
              <p className="text-xs text-gray-600">
                Create a new API key for this project. Give it a descriptive
                name to identify its purpose.
              </p>
            </div>
            <div className="space-y-2">
              <Form {...form}>
                <Label className="text-xs text-black/90">Key Name</Label>
                <ControlledInput
                  name="name"
                  placeholder="John's Key"
                  className="h-8 text-xs"
                />
              </Form>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => onSubmit()}
                loading={isSubmitting}
              >
                Generate Key
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
