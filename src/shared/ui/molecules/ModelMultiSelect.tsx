'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

export interface ModelOption {
  id: string;
  name: string;
  slug: string;
  category: 'LLM' | 'IMAGE';
}

export interface ModelMultiSelectProps {
  models: ModelOption[];
  selectedModelIds: string[];
  onChange: (modelIds: string[]) => void;
  loading?: boolean;
  label?: string;
  placeholder?: string;
}

export function ModelMultiSelect({
  models,
  selectedModelIds,
  onChange,
  loading = false,
  label,
  placeholder
}: ModelMultiSelectProps) {
  const t = useTranslations('modelMultiSelect');
  const effectivePlaceholder = placeholder ?? t('placeholder');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
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
        return t('languageModels');
      case 'IMAGE':
        return t('imageModels');
      default:
        return category;
    }
  };

  const getCategoryStyle = (category: 'LLM' | 'IMAGE') => {
    switch (category) {
      case 'LLM':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'IMAGE':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
    }
  };

  if (loading) {
    return (
      <div>
        {label && (
          <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/30 text-cyan-100/50 font-mono text-sm">
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-left focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] min-h-[42px] transition-all cursor-pointer"
        data-testid="model-multiselect-button"
      >
        {selectedModels.length === 0 ? (
          <span className="text-cyan-500/30 font-mono text-sm">{effectivePlaceholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedModels.map(model => (
              <span
                key={model.id}
                className={`inline-flex items-center px-2 py-0.5 text-xs font-mono border ${getCategoryStyle(model.category)}`}
              >
                {model.name}
                <button
                  onClick={(e) => removeModel(model.id, e)}
                  className="ml-1 hover:text-pink-400 cursor-pointer"
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

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] bg-[#0a0a0f] border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.1)] max-h-60 overflow-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          <div className="p-2 border-b border-cyan-500/30">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search')}
              className="w-full px-2 py-1 bg-[#050508]/50 border border-cyan-500/30 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400"
              autoFocus
              data-testid="model-search-input"
            />
          </div>

          <div className="p-1">
            {filteredModels.length === 0 ? (
              <div className="px-3 py-2 text-sm font-mono text-cyan-100/40">
                {t('noModelsFound')}
              </div>
            ) : (
              <>
                {/* LLM Section */}
                {groupedModels.LLM.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wide bg-cyan-500/5 border-b border-cyan-500/20">
                      {getCategoryLabel('LLM')}
                    </div>
                    {groupedModels.LLM.map(model => {
                      const isSelected = selectedModelIds.includes(model.id);
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => toggleModel(model.id)}
                          className={`w-full text-left px-3 py-2 hover:bg-cyan-500/10 flex items-center gap-2 cursor-pointer ${
                            isSelected ? 'bg-cyan-500/20' : ''
                          }`}
                          data-testid={`model-option-${model.slug}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="accent-cyan-500 cursor-pointer"
                          />
                          <span className="text-sm font-mono text-cyan-100">{model.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* IMAGE Section */}
                {groupedModels.IMAGE.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-mono text-purple-400 uppercase tracking-wide bg-purple-500/5 border-b border-purple-500/20">
                      {getCategoryLabel('IMAGE')}
                    </div>
                    {groupedModels.IMAGE.map(model => {
                      const isSelected = selectedModelIds.includes(model.id);
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => toggleModel(model.id)}
                          className={`w-full text-left px-3 py-2 hover:bg-purple-500/10 flex items-center gap-2 cursor-pointer ${
                            isSelected ? 'bg-purple-500/20' : ''
                          }`}
                          data-testid={`model-option-${model.slug}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="accent-purple-500 cursor-pointer"
                          />
                          <span className="text-sm font-mono text-cyan-100">{model.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
