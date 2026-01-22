'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';
import { Card } from '@/shared/ui/atoms';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface SystemWorkflow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  visibility: string;
  isSystemWorkflow: boolean;
  _count: {
    stages: number;
  };
}

export default function AdminSystemWorkflowsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('admin');
  const tw = useTranslations('admin.workflows');
  const [workflows, setWorkflows] = useState<SystemWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session && session.user?.role !== 'ADMIN') {
      router.push(ROUTES.DASHBOARD);
    }
  }, [session, router]);

  useEffect(() => {
    fetchSystemWorkflows();
  }, []);

  const fetchSystemWorkflows = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows?systemOnly=true');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to fetch system workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setWorkflows(
        workflows.map((w) => (w.id === id ? { ...w, isActive: !isActive } : w))
      );
    } catch {
      alert(tw('failedUpdate'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(tw('confirmDelete'))) return;
    try {
      await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch {
      alert(tw('failedDelete'));
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <div className="bg-pink-500/10 border border-pink-500/30 p-6 inline-block">
          <p className="text-pink-400 font-mono uppercase">{t('accessDenied')}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">{tw('loading')}</span>
        </div>
      </div>
    );
  }

  const header = tw('header');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight">
              <span className="cyber-text-glitch" data-text={header} style={{ color: '#00ffff', textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff40' }}>
                {header}
              </span>
            </h1>
            <span className="px-2 py-1 text-xs font-mono bg-pink-500/20 text-pink-400 border border-pink-500/50 uppercase">
              {t('badge')}
            </span>
          </div>
          <p className="text-cyan-100/60 font-mono text-sm uppercase tracking-wider mt-1">
            {tw('subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={ROUTES.ADMIN.SYSTEM_MINI_PROMPTS}>
            <button className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer">
              {tw('navMiniPrompts')}
            </button>
          </Link>
          <Link href={ROUTES.ADMIN.TAGS}>
            <button className="px-4 py-2 bg-transparent border border-pink-500/30 text-pink-400 font-mono text-sm uppercase tracking-wider hover:bg-pink-500/10 hover:border-pink-400 transition-all cursor-pointer">
              {tw('navTags')}
            </button>
          </Link>
          <Link href={ROUTES.LIBRARY.WORKFLOWS.NEW}>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              {tw('create')}
            </button>
          </Link>
        </div>
      </div>

      {workflows.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-cyan-100/40 font-mono uppercase mb-4">{tw('empty')}</p>
          <Link href={ROUTES.LIBRARY.WORKFLOWS.NEW}>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              {tw('createFirst')}
            </button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 p-4 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-mono text-cyan-400 flex-1 truncate">
                      {workflow.name}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/50 uppercase">
                      {tw('system')}
                    </span>
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-cyan-100/50 font-mono mb-4 line-clamp-2">
                      {workflow.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs font-mono text-cyan-100/40 mb-3">
                    <span>{tw('stages', { count: workflow._count.stages })}</span>
                    <span className="text-cyan-500/30">•</span>
                    <span>{workflow.visibility}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workflow.isActive}
                      onChange={() => handleToggleActive(workflow.id, workflow.isActive)}
                      className="w-4 h-4 accent-cyan-500 cursor-pointer"
                      data-testid={`workflow-toggle-${workflow.id}`}
                    />
                    <span className={`text-xs font-mono uppercase ${workflow.isActive ? 'text-green-400' : 'text-cyan-100/40'}`}>
                      {workflow.isActive ? tw('active') : tw('inactive')}
                    </span>
                  </label>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={ROUTES.LIBRARY.WORKFLOWS.EDIT(workflow.id)}>
                    <button className="p-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all cursor-pointer">
                      <EditIcon fontSize="small" />
                    </button>
                  </Link>
                  <button
                    className="p-2 bg-pink-500/20 border border-pink-500/30 text-pink-400 hover:bg-pink-500/30 transition-all cursor-pointer"
                    onClick={() => handleDelete(workflow.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
