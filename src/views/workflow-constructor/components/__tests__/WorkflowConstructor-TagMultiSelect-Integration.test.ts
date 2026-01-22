import '@testing-library/jest-dom';

// Integration test to verify WorkflowHeader uses ModelMultiSelect
// Note: TagMultiSelect was removed from WorkflowHeader as tags are no longer used for workflows

import * as fs from 'fs';
import * as path from 'path';

describe('WorkflowConstructor - ModelMultiSelect Integration', () => {
  let componentCode: string;
  let headerCode: string;

  beforeAll(() => {
    const componentPath = path.join(__dirname, '..', 'WorkflowConstructor.tsx');
    const headerPath = path.join(__dirname, '..', 'WorkflowHeader.tsx');
    componentCode = fs.readFileSync(componentPath, 'utf8');
    headerCode = fs.readFileSync(headerPath, 'utf8');
  });

  it('should import ModelMultiSelect from shared/ui/molecules in WorkflowHeader', () => {
    expect(headerCode).toContain("ModelMultiSelect");
    expect(headerCode).toContain("from '@/shared/ui/molecules/ModelMultiSelect'");
  });

  it('should not import TagSelector anymore', () => {
    expect(componentCode).not.toContain("import { TagSelector }");
    expect(headerCode).not.toContain("import { TagSelector }");
  });

  it('should use ModelMultiSelect component in WorkflowHeader', () => {
    expect(headerCode).toContain('<ModelMultiSelect');
  });

  it('should not use TagSelector component', () => {
    expect(componentCode).not.toContain('<TagSelector');
    expect(headerCode).not.toContain('<TagSelector');
  });

  it('should pass models and selectedModelIds props to ModelMultiSelect', () => {
    expect(headerCode).toContain('models={models}');
    expect(headerCode).toContain('selectedModelIds={selectedModelIds}');
    expect(headerCode).toContain('onChange={onSelectedModelIdsChange}');
  });

  it('should pass selectedModelIds prop to ModelMultiSelect', () => {
    expect(headerCode).toContain('selectedModelIds={selectedModelIds}');
  });

  it('should pass onChange callback to ModelMultiSelect', () => {
    expect(headerCode).toContain('onChange={onSelectedModelIdsChange}');
  });

  it('should pass loading prop to ModelMultiSelect', () => {
    expect(headerCode).toContain('loading={modelsLoading}');
  });

  it('should pass placeholder prop to ModelMultiSelect', () => {
    const modelMultiSelectMatch = headerCode.match(/<ModelMultiSelect[\s\S]*?\/>/);
    expect(modelMultiSelectMatch).toBeTruthy();

    if (modelMultiSelectMatch) {
      const modelMultiSelectBlock = modelMultiSelectMatch[0];
      expect(modelMultiSelectBlock).toContain('placeholder=');
    }
  });

  it('should use useModels hook in WorkflowHeader', () => {
    expect(headerCode).toContain("import { useModels }");
    expect(headerCode).toContain("const { models, loading: modelsLoading } = useModels()");
  });
});
