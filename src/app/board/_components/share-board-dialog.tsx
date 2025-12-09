"use client";

import { useState } from "react";

import { Check, Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ShareBoardDialogProps {
  boardId: string;
  initialShareToken: string | null;
  initialIsPubliclyShared: boolean;
}

export function ShareBoardDialog({
  boardId,
  initialShareToken,
  initialIsPubliclyShared,
}: ShareBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<"board" | null>(null);
  const [isPubliclyShared, setIsPubliclyShared] = useState(initialIsPubliclyShared);
  const [shareToken] = useState(initialShareToken ?? "demo-token-123");

  const handleToggleSharing = (enabled: boolean) => {
    setIsPubliclyShared(enabled);
    toast.success(enabled ? "Public sharing enabled" : "Public sharing disabled");
  };

  const getShareUrl = () => {
    if (typeof window === "undefined" || !shareToken) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/board/${boardId}?token=${shareToken}`;
  };

  const handleCopy = async () => {
    const url = getShareUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink("board");
      toast.success("Board link copied");
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenPreview = () => {
    const url = getShareUrl();
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Board</DialogTitle>
          <DialogDescription>
            Share a read-only view of your board with anyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="flex items-center gap-3">
              <Link2 className="text-muted-foreground h-5 w-5" />
              <div>
                <Label htmlFor="share-toggle" className="text-sm font-medium">
                  Public sharing
                </Label>
                <p className="text-muted-foreground text-xs">
                  Anyone with the link can view
                </p>
              </div>
            </div>
            <Switch
              id="share-toggle"
              checked={isPubliclyShared}
              onCheckedChange={handleToggleSharing}
            />
          </div>

          {isPubliclyShared && shareToken && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Board Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getShareUrl()}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={handleCopy}
                  title="Copy link"
                >
                  {copiedLink === "board" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={handleOpenPreview}
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

