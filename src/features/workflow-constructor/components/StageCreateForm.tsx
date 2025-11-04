'use client';

import { useState } from 'react';
import Button from '@/shared/ui/atoms/Button';
import Input from '@/shared/ui/atoms/Input';
import InfoIcon from '@mui/icons-material/Info';

interface StageCreateFormProps {
  onSubmit: (name: string, description: string, color: string, withReview: boolean) => void;
  onCancel: () => void;
  initialValues?: {
    name: string;
    description?: string | null;
    color: string;
    withReview: boolean;
  };
  mode?: 'create' | 'edit';
}

const STAGE_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#10B981', label: 'Green' },
  { value: '#EF4444', label: 'Red' },
  { value: '#64748b', label: 'Gray' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#14B8A6', label: 'Teal' },
];

export function StageCreateForm({ onSubmit, onCancel, initialValues, mode = 'create' }: StageCreateFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [color, setColor] = useState(initialValues?.color || '#3B82F6');
  const [withReview, setWithReview] = useState(initialValues?.withReview ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim(), color, withReview);
      setName('');
      setDescription('');
      setColor('#3B82F6');
      setWithReview(true);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-base border border-border-base rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {mode === 'edit' ? 'Edit Stage' : 'Create New Stage'}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="stage-name" className="block text-sm font-medium text-text-primary mb-1">
            Stage Name *
          </label>
          <Input
            id="stage-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Analysis, Planning, Implementation"
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="stage-description" className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            id="stage-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description for this stage"
            rows={3}
            className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-text-primary bg-surface-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {STAGE_COLORS.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => setColor(colorOption.value)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  color === colorOption.value
                    ? 'border-text-primary scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: colorOption.value }}
                title={colorOption.label}
              />
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border-base">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="with-review"
              checked={withReview}
              onChange={(e) => setWithReview(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="with-review" className="text-sm font-medium text-text-primary">
              With Review
            </label>
            <div className="group relative inline-block">
              <InfoIcon className="w-4 h-4 text-text-tertiary cursor-help" />
              <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                Add review step after this stage to validate progress before moving forward
              </div>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-1 ml-6">
            Recommended: Add review between stages to prevent context collapse
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!name.trim()}
        >
          {mode === 'edit' ? 'Save Changes' : 'Create Stage'}
        </Button>
      </div>
    </form>
  );
}
