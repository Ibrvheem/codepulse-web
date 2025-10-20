"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PatKeyCard({ patKey }: { patKey: any }) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{patKey.name}</p>
          <p className="text-xs text-gray-500">
            Created {new Date(patKey.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </Button>
          <Button variant="ghost" size="sm">
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {showKey && (
        <div className="bg-gray-50 p-2 rounded border">
          <p className="font-mono text-xs text-gray-700">
            pat_xxxxxxxxxxxxxxxxxxxxxxxxxx
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Badge
          variant={patKey.lastUsed ? "default" : "secondary"}
          className="text-xs"
        >
          {patKey.lastUsed ? "Active" : "Unused"}
        </Badge>
        {patKey.lastUsed && (
          <span className="text-xs text-gray-500">
            Last used: {new Date(patKey.lastUsed).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
