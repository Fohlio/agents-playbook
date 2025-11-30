'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Model type for the UI component
 * Pure UI - no Prisma imports
 */
export interface ModelOption {
  id: string;
  name: string;
  slug: string;
  category: 'LLM' | 'IMAGE';
}

export interface ModelMultiSelectProps {
  /** Available models to select from */
  models: ModelOption[];
  /** Currently selected model IDs */
  selectedModelIds: string[];
  /** Callback when selection changes */
  onChange: (modelIds: string[]) => void;
  /** Whether models are loading */
  loading?: boolean;
  /** Label for the component */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * ModelMultiSelect Component
 *
 * Pure UI multi-select dropdown for AI models with category grouping.
 * Displays selected models as badges with remove buttons.
 * No create option - models are predefined.
 *
 * FSD Layer: shared/ui/molecules
 * - Pure UI component, no data fetching
 * - Receives all data via props
 */
export function ModelMultiSelect({
  models,
  selectedModelIds,
  onChange,
  loading = false,
  label,
  placeholder = 'Select models...'
}: ModelMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedModels = models.filter(m => selectedModelIds.includes(m.id));
  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered models by category
  const groupedModels = {
    LLM: filteredModels.filter(m => m.category === 'LLM'),
    IMAGE: filteredModels.filter(m => m.category === 'IMAGE'),
  };

  const toggleModel = (modelId: string) => {
    if (selectedModelIds.includes(modelId)) {
      onChange(selectedModelIds.filter(id => id !== modelId));
    } else {
      onChange([...selectedModelIds, modelId]);
    }
  };

  const removeModel = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedModelIds.filter(id => id !== modelId));
  };

  const getCategoryLabel = (category: 'LLM' | 'IMAGE') => {
    switch (category) {
      case 'LLM':
        return 'Large Language Models';
      case 'IMAGE':
        return 'Image Generation Models';
      default:
        return category;
    }
  };

  const getCategoryStyle = (category: 'LLM' | 'IMAGE') => {
    switch (category) {
      case 'LLM':
        return 'bg-blue-100 text-blue-800';
      case 'IMAGE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {label}
          </label>
        )}
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
          Loading models...
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[42px]"
        data-testid="model-multiselect-button"
      >
        {selectedModels.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedModels.map(model => (
              <span
                key={model.id}
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${getCategoryStyle(model.category)}`}
              >
                {model.name}
                <button
                  onClick={(e) => removeModel(model.id, e)}
                  className="ml-1 hover:text-red-600"
                  type="button"
                  aria-label={`Remove ${model.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search models..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
              data-testid="model-search-input"
            />
          </div>

          <div className="p-1">
            {filteredModels.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No models found
              </div>
            ) : (
              <>
                {/* LLM Section */}
                {groupedModels.LLM.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                      {getCategoryLabel('LLM')}
                    </div>
                    {groupedModels.LLM.map(model => {
                      const isSelected = selectedModelIds.includes(model.id);
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => toggleModel(model.id)}
                          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                          data-testid={`model-option-${model.slug}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm">{model.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* IMAGE Section */}
                {groupedModels.IMAGE.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                      {getCategoryLabel('IMAGE')}
                    </div>
                    {groupedModels.IMAGE.map(model => {
                      const isSelected = selectedModelIds.includes(model.id);
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => toggleModel(model.id)}
                          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 ${
                            isSelected ? 'bg-purple-50' : ''
                          }`}
                          data-testid={`model-option-${model.slug}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-purple-600"
                          />
                          <span className="text-sm">{model.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
