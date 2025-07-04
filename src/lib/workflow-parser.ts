import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ParsedWorkflow {
  id: string;
  title: string;
  description: string;
  complexity: 'Simple' | 'Standard' | 'Complex';
  keywords: string[];
  file_path: string;
  category: string;
  use_case: string;
  output: string;
  steps: WorkflowStep[];
  next_workflows?: string[];
}

export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  estimated_time?: string;
  content: string;
}

export class WorkflowParser {
  private agentsPlaybookPath: string;

  constructor(agentsPlaybookPath: string = './playbook') {
    this.agentsPlaybookPath = agentsPlaybookPath;
  }

  /**
   * Parse all MD files in agents-playbook directory structure
   */
  async parseAllWorkflows(): Promise<ParsedWorkflow[]> {
    const workflows: ParsedWorkflow[] = [];
    
    try {
      // Parse prompt-playbook.md for workflow metadata
      const mainPlaybook = await this.parseMainPlaybook();
      
      // Parse individual prompt files
      const directories = ['planning', 'kickoff', 'qa'];
      
      for (const dir of directories) {
        const dirPath = path.join(this.agentsPlaybookPath, dir);
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));
          
          for (const file of files) {
            try {
              const workflow = await this.parseWorkflowFile(path.join(dirPath, file), dir);
              if (workflow) {
                workflows.push(workflow);
              }
            } catch (error) {
              console.warn(`[Parser] Failed to parse ${file}:`, error);
            }
          }
        }
      }

      console.log(`[Parser] Successfully parsed ${workflows.length} workflows`);
      return workflows;
      
    } catch (error) {
      console.error('[Parser] Error parsing workflows:', error);
      return [];
    }
  }

  /**
   * Parse prompt-playbook.md to extract workflow metadata
   */
  private async parseMainPlaybook(): Promise<any> {
    const playbookPath = path.join(this.agentsPlaybookPath, 'prompt-playbook.md');
    
    if (!fs.existsSync(playbookPath)) {
      console.warn('[Parser] prompt-playbook.md not found');
      return {};
    }

    const content = fs.readFileSync(playbookPath, 'utf-8');
    // Extract workflow table information
    // This helps map prompt files to their metadata
    return { content };
  }

  /**
   * Parse individual workflow/prompt file
   */
  private async parseWorkflowFile(filePath: string, category: string): Promise<ParsedWorkflow | null> {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(fileContent);
    const content = parsed.content;
    const frontmatter = parsed.data;

    // Extract title from filename or content
    const filename = path.basename(filePath, '.md');
    const title = frontmatter.title || this.extractTitleFromContent(content) || filename;
    
    // Generate ID from filename
    const id = filename.replace(/-prompt$/, '').replace(/-/g, '-');
    
    // Extract description and other metadata
    const description = frontmatter.description || this.extractDescriptionFromContent(content);
    const complexity = frontmatter.complexity || this.inferComplexity(content);
    const keywords = frontmatter.keywords || this.extractKeywords(title, description, content);
    
    // Parse workflow steps
    const steps = this.parseSteps(content);
    
    // Extract use case and output from content
    const { use_case, output } = this.extractUseCaseAndOutput(content);

    return {
      id,
      title,
      description,
      complexity,
      keywords,
      file_path: path.relative(process.cwd(), filePath),
      category,
      use_case,
      output,
      steps,
      next_workflows: frontmatter.next_workflows
    };
  }

  /**
   * Extract title from markdown content
   */
  private extractTitleFromContent(content: string): string {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].replace(/^(Prompt\s*[•·]\s*)/i, '').trim() : '';
  }

  /**
   * Extract description from content
   */
  private extractDescriptionFromContent(content: string): string {
    // Look for use case or description patterns
    const patterns = [
      /use case[:\s]+(.+?)(?:\n|\|)/i,
      /description[:\s]+(.+?)(?:\n|\|)/i,
      /##\s*overview\s*\n(.+?)(?:\n#)/is
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Fallback: get first meaningful paragraph
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    return lines[0]?.substring(0, 100) + '...' || '';
  }

  /**
   * Infer complexity from content length and structure
   */
  private inferComplexity(content: string): 'Simple' | 'Standard' | 'Complex' {
    const length = content.length;
    const sectionCount = (content.match(/^##/gm) || []).length;
    
    if (length > 3000 || sectionCount > 8) return 'Complex';
    if (length > 1500 || sectionCount > 4) return 'Standard';
    return 'Simple';
  }

  /**
   * Extract keywords from title and content
   */
  private extractKeywords(title: string, description: string, content: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords = new Set<string>();
    
    // Common workflow keywords
    const commonKeywords = [
      'planning', 'development', 'kickoff', 'qa', 'testing', 'validation',
      'feature', 'bug', 'fix', 'implementation', 'architecture', 'refactoring',
      'product', 'trd', 'brd', 'documentation', 'migration', 'research'
    ];
    
    commonKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywords.add(keyword);
      }
    });
    
    // Extract from title words
    title.toLowerCase().split(/[\s-]+/).forEach(word => {
      if (word.length > 3) {
        keywords.add(word);
      }
    });
    
    return Array.from(keywords);
  }

  /**
   * Parse workflow steps from content
   */
  private parseSteps(content: string): WorkflowStep[] {
    const steps: WorkflowStep[] = [];
    
    // Look for numbered workflow sections
    const workflowMatch = content.match(/## Workflow\s*\n([\s\S]+?)(?:\n##|$)/i);
    if (!workflowMatch) return steps;
    
    const workflowContent = workflowMatch[1];
    const stepMatches = workflowContent.match(/(\d+)\.\s*\*\*(.+?)\*\*[:\s]*(.+?)(?=\n\d+\.|$)/gs);
    
    if (stepMatches) {
      stepMatches.forEach((stepMatch, index) => {
        const match = stepMatch.match(/(\d+)\.\s*\*\*(.+?)\*\*[:\s]*([\s\S]+)/);
        if (match) {
          steps.push({
            step: parseInt(match[1]),
            title: match[2].trim(),
            description: match[3].trim().split('\n')[0],
            content: match[3].trim()
          });
        }
      });
    }
    
    return steps;
  }

  /**
   * Extract use case and output information
   */
  private extractUseCaseAndOutput(content: string): { use_case: string; output: string } {
    const useCaseMatch = content.match(/use case[:\s]+(.+?)(?:\n|\|)/i);
    const outputMatch = content.match(/output[:\s]+(.+?)(?:\n|\|)/i);
    
    return {
      use_case: useCaseMatch ? useCaseMatch[1].trim() : '',
      output: outputMatch ? outputMatch[1].trim() : ''
    };
  }
} 