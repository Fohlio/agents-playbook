"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/atoms";
import { CreateTopicModal } from "./CreateTopicModal";

export function CreateTopicButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsModalOpen(true)}
      >
        Create Topic
      </Button>

      <CreateTopicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
