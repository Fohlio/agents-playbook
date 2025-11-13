import '@testing-library/jest-dom';

// Simple integration test to verify TagMultiSelect replacement in WorkflowHeader
// We verify the code structure without rendering the full component
// Note: TagMultiSelect was moved to WorkflowHeader.tsx during refactoring

import * as fs from 'fs';
import * as path from 'path';

describe('WorkflowConstructor - TagMultiSelect Integration', () => {
  let componentCode: string;
  let headerCode: string;

  beforeAll(() => {
    const componentPath = path.join(__dirname, '..', 'WorkflowConstructor.tsx');
    const headerPath = path.join(__dirname, '..', 'WorkflowHeader.tsx');
    componentCode = fs.readFileSync(componentPath, 'utf8');
    headerCode = fs.readFileSync(headerPath, 'utf8');
  });

  it('should import TagMultiSelect from shared/ui/molecules in WorkflowHeader', () => {
    expect(headerCode).toContain("TagMultiSelect");
    expect(headerCode).toContain("from '@/shared/ui/molecules'");
  });

  it('should not import TagSelector anymore', () => {
    expect(componentCode).not.toContain("import { TagSelector }");
    expect(headerCode).not.toContain("import { TagSelector }");
  });

  it('should use TagMultiSelect component in WorkflowHeader', () => {
    expect(headerCode).toContain('<TagMultiSelect');
  });

  it('should not use TagSelector component', () => {
    expect(componentCode).not.toContain('<TagSelector');
    expect(headerCode).not.toContain('<TagSelector');
  });

  it('should pass selectedTagIds and onChange props to TagMultiSelect', () => {
    // TagMultiSelect doesn't require label/placeholder props - they have defaults
    expect(headerCode).toContain('selectedTagIds={selectedTagIds}');
    expect(headerCode).toContain('onChange={onSelectedTagIdsChange}');
  });

  it('should pass selectedTagIds prop to TagMultiSelect', () => {
    expect(headerCode).toContain('selectedTagIds={selectedTagIds}');
  });

  it('should pass onChange callback to TagMultiSelect', () => {
    expect(headerCode).toContain('onChange={onSelectedTagIdsChange}');
  });

  it('should not have allowCreate prop (simplified from TagSelector)', () => {
    // Verify the old TagSelector's allowCreate prop is removed
    const tagMultiSelectSection = headerCode.match(/<TagMultiSelect[\s\S]*?\/>/);
    if (tagMultiSelectSection) {
      expect(tagMultiSelectSection[0]).not.toContain('allowCreate');
    }
  });

  it('should not have onCreateTag prop (simplified from TagSelector)', () => {
    // Verify the old TagSelector's onCreateTag prop is removed
    const tagMultiSelectSection = headerCode.match(/<TagMultiSelect[\s\S]*?\/>/);
    if (tagMultiSelectSection) {
      expect(tagMultiSelectSection[0]).not.toContain('onCreateTag');
    }
  });

  it('should use simpler API with fewer props than TagSelector', () => {
    // TagMultiSelect should have: selectedTagIds, onChange (label and placeholder are optional with defaults)
    // TagSelector had: selectedTagIds, onChange, allowCreate, onCreateTag
    const tagMultiSelectMatch = headerCode.match(/<TagMultiSelect[\s\S]*?\/>/);
    expect(tagMultiSelectMatch).toBeTruthy();

    if (tagMultiSelectMatch) {
      const tagMultiSelectBlock = tagMultiSelectMatch[0];
      // Should have the required props
      expect(tagMultiSelectBlock).toContain('selectedTagIds');
      expect(tagMultiSelectBlock).toContain('onChange');
      // Should NOT have the old TagSelector props
      expect(tagMultiSelectBlock).not.toContain('allowCreate');
      expect(tagMultiSelectBlock).not.toContain('onCreateTag');
    }
  });
});
