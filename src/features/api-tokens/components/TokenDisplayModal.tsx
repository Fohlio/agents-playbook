"use client";

import { useState } from "react";
import {
  Button,
  Alert,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from "@/shared/ui/atoms";

interface TokenDisplayModalProps {
  isOpen: boolean;
  token: string | null;
  onClose: () => void;
}

export function TokenDisplayModal({ isOpen, token, onClose }: TokenDisplayModalProps) {
  const [success, setSuccess] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Token copied to clipboard");
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleClose = () => {
    onClose();
    setSuccess(null);
  };

  return (
    <Modal
      isOpen={isOpen && !!token}
      className="max-w-lg"
      testId="token-display-modal"
    >
      <ModalHeader title="Token Created Successfully" testId="token-display-modal-heading" />
      <ModalBody>
        <div className="mb-4">
          <Alert variant="warning" testId="token-display-warning">
            <strong>Important:</strong> Copy this token now. You won&apos;t be
            able to see it again!
          </Alert>
        </div>
        {success && (
          <div className="mb-4">
            <Alert variant="success">{success}</Alert>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Your API Token
          </label>
          <div className="flex gap-2">
            <Input
              value={token || ""}
              readOnly
              fullWidth
              className="font-mono text-sm"
              testId="token-display-input"
            />
            <Button
              variant="secondary"
              onClick={() => token && copyToClipboard(token)}
              testId="copy-token-button"
            >
              Copy
            </Button>
          </div>
        </div>
      </ModalBody>
      <ModalActions>
        <Button
          variant="primary"
          onClick={handleClose}
          testId="close-token-modal-button"
        >
          I&apos;ve Saved My Token
        </Button>
      </ModalActions>
    </Modal>
  );
}

