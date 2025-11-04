"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  FormField,
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from "@/shared/ui/atoms";

const tokenNameSchema = z.object({
  name: z
    .string()
    .min(1, "Token name is required")
    .max(100, "Token name must be at most 100 characters"),
});

type TokenNameInput = z.infer<typeof tokenNameSchema>;

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export function CreateTokenModal({ isOpen, onClose, onSubmit }: CreateTokenModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TokenNameInput>({
    resolver: zodResolver(tokenNameSchema),
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleFormSubmit = async (data: TokenNameInput) => {
    await onSubmit(data.name);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} testId="create-token-modal">
      <ModalHeader title="Create API Token" testId="create-token-modal-heading" />
      <ModalBody>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            label="Token Name"
            htmlFor="tokenName"
            required
            error={errors.name?.message}
            helperText="A descriptive name for this token"
          >
            <Input
              id="tokenName"
              type="text"
              placeholder="My MCP Token"
              error={!!errors.name}
              fullWidth
              testId="token-name-input"
              {...register("name")}
            />
          </FormField>
          <ModalActions>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              testId="cancel-create-token-button"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" testId="submit-create-token-button">
              Create Token
            </Button>
          </ModalActions>
        </form>
      </ModalBody>
    </Modal>
  );
}

