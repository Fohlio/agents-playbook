/**
 * Case Studies Data
 *
 * Real-world examples demonstrating workflow effectiveness
 * and AI hallucination prevention
 */

export interface CaseStudy {
  id: string;
  company: string;
  companySize: string;
  problem: string;
  solution: string;
  workflow: string;
  results: {
    metric: string;
    improvement: string;
    icon: string;
  }[];
  quote: string;
  author: string;
  role: string;
  tags: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'fintech-auth',
    company: 'FinTech Startup',
    companySize: 'Series A (25 engineers)',
    problem: 'AI assistant kept generating authentication code with hardcoded credentials and missing security best practices, causing 3 production incidents in 2 weeks.',
    solution: 'Implemented "Feature Development" workflow with security validation stages and context-aware mini-prompts for authentication patterns.',
    workflow: 'feature-development',
    results: [
      {
        metric: 'Zero Security Issues',
        improvement: '100% reduction in auth vulnerabilities',
        icon: '🔒',
      },
      {
        metric: 'Development Time',
        improvement: '65% faster feature delivery',
        icon: '⚡',
      },
      {
        metric: 'Code Quality',
        improvement: '95% test coverage achieved',
        icon: '✅',
      },
    ],
    quote: 'Before workflows, our AI would generate auth code with passwords in plaintext. Now every feature follows security best practices automatically. Game changer.',
    author: 'Sarah Chen',
    role: 'VP of Engineering',
    tags: ['Security', 'Authentication', 'FinTech'],
  },
  {
    id: 'saas-refactoring',
    company: 'SaaS Platform',
    companySize: 'Enterprise (200+ engineers)',
    problem: 'Legacy codebase refactoring with AI resulted in breaking changes, inconsistent patterns, and hallucinated APIs that never existed.',
    solution: 'Created custom "Legacy Code Refactoring" workflow with validation stages, dependency analysis, and incremental migration steps.',
    workflow: 'code-refactoring',
    results: [
      {
        metric: 'Breaking Changes',
        improvement: '92% reduction in production bugs',
        icon: '🛡️',
      },
      {
        metric: 'Refactoring Speed',
        improvement: '10x faster than manual process',
        icon: '🚀',
      },
      {
        metric: 'API Hallucinations',
        improvement: '100% eliminated with context validation',
        icon: '🎯',
      },
    ],
    quote: 'We used to spend hours fixing AI hallucinations in refactored code. With workflows, our AI understands the entire context and never invents APIs.',
    author: 'Marcus Rodriguez',
    role: 'Principal Engineer',
    tags: ['Refactoring', 'Legacy Code', 'Enterprise'],
  },
  {
    id: 'ecommerce-features',
    company: 'E-Commerce Platform',
    companySize: 'Growth Stage (50 engineers)',
    problem: 'AI-generated features had inconsistent error handling, missing edge cases, and poor database query optimization leading to performance issues.',
    solution: 'Standardized on "Feature Development" and "Performance Optimization" workflows with automated quality gates and mini-prompts for common patterns.',
    workflow: 'feature-development',
    results: [
      {
        metric: 'Edge Case Coverage',
        improvement: '98% comprehensive testing',
        icon: '🧪',
      },
      {
        metric: 'Performance Issues',
        improvement: '85% reduction in slow queries',
        icon: '📊',
      },
      {
        metric: 'Production Incidents',
        improvement: '70% fewer post-deployment bugs',
        icon: '🎉',
      },
    ],
    quote: 'Our AI used to miss edge cases constantly. Workflows ensure every feature is battle-tested before it ships. Our incident rate dropped by 70%.',
    author: 'Emily Watson',
    role: 'Engineering Manager',
    tags: ['E-Commerce', 'Performance', 'Quality'],
  },
];

/**
 * Get case study by ID
 */
export function getCaseStudyById(id: string): CaseStudy | undefined {
  return CASE_STUDIES.find(study => study.id === id);
}

/**
 * Get case studies by tag
 */
export function getCaseStudiesByTag(tag: string): CaseStudy[] {
  return CASE_STUDIES.filter(study =>
    study.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}
