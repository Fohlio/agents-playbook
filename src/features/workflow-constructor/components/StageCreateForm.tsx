'use client';

import { useState } from 'react';
import Button from '@/shared/ui/atoms/Button';
import Input from '@/shared/ui/atoms/Input';

interface StageCreateFormProps {
  onSubmit: (name: string, description: string, color: string) => void;
  onCancel: () => void;
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

export function StageCreateForm({ onSubmit, onCancel }: StageCreateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim(), color);
      setName('');
      setDescription('');
      setColor('#3B82F6');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-base border border-border-base rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-4">Create New Stage</h3>

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
          Create Stage
        </Button>
      </div>
    </form>
  );
}
