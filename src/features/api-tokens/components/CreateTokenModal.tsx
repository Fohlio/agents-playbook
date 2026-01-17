"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("settings.apiTokens");
  const tCommon = useTranslations("common");
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
      <ModalHeader title={t("createModal.title")} testId="create-token-modal-heading" />
      <ModalBody>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            label={t("tokenName")}
            htmlFor="tokenName"
            required
            error={errors.name?.message}
            helperText={t("tokenNameHelper")}
          >
            <Input
              id="tokenName"
              type="text"
              placeholder={t("tokenNamePlaceholder")}
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
              {tCommon("cancel")}
            </Button>
            <Button type="submit" variant="primary" testId="submit-create-token-button">
              {t("createToken")}
            </Button>
          </ModalActions>
        </form>
      </ModalBody>
    </Modal>
  );
}

