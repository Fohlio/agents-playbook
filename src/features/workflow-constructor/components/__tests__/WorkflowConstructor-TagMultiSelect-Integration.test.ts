import '@testing-library/jest-dom';

// Simple integration test to verify TagMultiSelect replacement in WorkflowConstructor
// We verify the code structure without rendering the full component

import * as fs from 'fs';
import * as path from 'path';

describe('WorkflowConstructor - TagMultiSelect Integration', () => {
  let componentCode: string;

  beforeAll(() => {
    const componentPath = path.join(__dirname, '..', 'WorkflowConstructor.tsx');
    componentCode = fs.readFileSync(componentPath, 'utf8');
  });

  it('should import TagMultiSelect from shared/ui/molecules', () => {
    expect(componentCode).toContain("import { TagMultiSelect } from '@/shared/ui/molecules'");
  });

  it('should not import TagSelector anymore', () => {
    expect(componentCode).not.toContain("import { TagSelector }");
  });

  it('should use TagMultiSelect component', () => {
    expect(componentCode).toContain('<TagMultiSelect');
  });

  it('should not use TagSelector component', () => {
    expect(componentCode).not.toContain('<TagSelector');
  });

  it('should pass label="Tags" prop to TagMultiSelect', () => {
    expect(componentCode).toContain('label="Tags"');
  });

  it('should pass placeholder prop to TagMultiSelect', () => {
    expect(componentCode).toMatch(/placeholder=".*?"/);
  });

  it('should pass selectedTagIds prop to TagMultiSelect', () => {
    expect(componentCode).toContain('selectedTagIds={selectedTagIds}');
  });

  it('should pass onChange callback to TagMultiSelect', () => {
    expect(componentCode).toContain('onChange={(tagIds) => {');
    expect(componentCode).toContain('setSelectedTagIds(tagIds)');
    expect(componentCode).toContain('markDirty()');
  });

  it('should not have allowCreate prop (simplified from TagSelector)', () => {
    // Verify the old TagSelector's allowCreate prop is removed
    const tagMultiSelectSection = componentCode.match(/<TagMultiSelect[\s\S]*?\/>/);
    if (tagMultiSelectSection) {
      expect(tagMultiSelectSection[0]).not.toContain('allowCreate');
    }
  });

  it('should not have onCreateTag prop (simplified from TagSelector)', () => {
    // Verify the old TagSelector's onCreateTag prop is removed
    const tagMultiSelectSection = componentCode.match(/<TagMultiSelect[\s\S]*?\/>/);
    if (tagMultiSelectSection) {
      expect(tagMultiSelectSection[0]).not.toContain('onCreateTag');
    }
  });

  it('should use simpler API with fewer props than TagSelector', () => {
    // TagMultiSelect should have: selectedTagIds, onChange, label, placeholder
    // TagSelector had: selectedTagIds, onChange, allowCreate, onCreateTag
    const tagMultiSelectMatch = componentCode.match(/<TagMultiSelect[\s\S]*?\/>/);
    expect(tagMultiSelectMatch).toBeTruthy();

    if (tagMultiSelectMatch) {
      const tagMultiSelectBlock = tagMultiSelectMatch[0];
      // Should have the 4 props
      expect(tagMultiSelectBlock).toContain('selectedTagIds');
      expect(tagMultiSelectBlock).toContain('onChange');
      expect(tagMultiSelectBlock).toContain('label');
      expect(tagMultiSelectBlock).toContain('placeholder');
    }
  });
});
