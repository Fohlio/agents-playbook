import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from "@/shared/ui/atoms";

interface RevokeTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RevokeTokenModal({ isOpen, onClose, onConfirm }: RevokeTokenModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      testId="revoke-token-modal"
    >
      <ModalHeader title="Revoke Token?" testId="revoke-token-modal-heading" />
      <ModalBody>
        <p className="text-sm text-gray-600" data-testid="revoke-token-modal-description">
          This will permanently revoke the token. Any applications using
          this token will no longer be able to authenticate.
        </p>
      </ModalBody>
      <ModalActions>
        <Button
          variant="secondary"
          onClick={onClose}
          testId="cancel-revoke-button"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          testId="confirm-revoke-button"
        >
          Revoke Token
        </Button>
      </ModalActions>
    </Modal>
  );
}

