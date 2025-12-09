"use client";

import { Suspense } from "react";

import { BoardPageContent } from "./_components/board-page-content";
import { BoardStoreProvider } from "./store/board-store";
import { ConfirmationDialogProvider } from "@/providers/ConfirmationDialogProvider";

export default function BoardPage() {
  const boardId = "demo-board";
  const boardName = "Demo Board";

  return (
    <ConfirmationDialogProvider>
      <BoardStoreProvider boardId={boardId} boardName={boardName}>
        <Suspense fallback={<div>Loading...</div>}>
          <BoardPageContent />
        </Suspense>
      </BoardStoreProvider>
    </ConfirmationDialogProvider>
  );
}

