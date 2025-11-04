import { Badge } from '@/shared/ui/atoms';

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface TagBadgeListProps {
  tags: Tag[];
  maxDisplay?: number;
}

export function TagBadgeList({ tags, maxDisplay = 3 }: TagBadgeListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map(tag => (
        <Badge
          key={tag.id}
          variant="default"
          testId={`tag-badge-${tag.name}`}
        >
          {tag.name}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="default">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
