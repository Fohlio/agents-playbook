import { Badge } from '@/shared/ui/atoms';

interface Model {
  id: string;
  name: string;
  slug?: string;
  category: 'LLM' | 'IMAGE';
}

interface ModelBadgeListProps {
  models: Model[];
  maxDisplay?: number;
}

/**
 * ModelBadgeList Component
 * 
 * Displays AI model badges on discovery cards.
 * LLM models: blue badge
 * IMAGE models: purple badge
 * 
 * FSD Layer: shared/ui/molecules
 */
export function ModelBadgeList({ models, maxDisplay = 3 }: ModelBadgeListProps) {
  if (!models || models.length === 0) {
    return null;
  }

  const displayModels = models.slice(0, maxDisplay);
  const remainingCount = models.length - maxDisplay;

  const getCategoryStyle = (category: 'LLM' | 'IMAGE') => {
    switch (category) {
      case 'LLM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IMAGE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayModels.map((model) => (
        <span
          key={model.id}
          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${getCategoryStyle(model.category)}`}
          data-testid={`model-badge-${model.slug || model.id}`}
        >
          {model.name}
        </span>
      ))}
      {remainingCount > 0 && (
        <Badge variant="default">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

