'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInstallPrompt } from '../contexts/InstallContext';
import { Trophy, CheckCircle2, Circle, X, ChevronRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface Task {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    action?: string; // URL to redirect
    tourTrigger?: string; // ID to trigger tour
}

export default function JornadaModal() {
    const { user, refreshUser } = useAuth();
    const { isInstalled, triggerInstall } = useInstallPrompt();
    const [isOpen, setIsOpen] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [progress, setProgress] = useState(0);

    // Gamification Logic
    useEffect(() => {
        if (!user) return;

        const checkList: Task[] = [
            {
                id: 'profile',
                title: 'Finalize seu Perfil',
                description: 'Adicione sua Bio e Telefone para passar confiança.',
                isCompleted: !!(user.bio && user.phone),
                action: '/perfil'
            },
            {
                id: 'pix',
                title: 'Cadastre sua Chave Pix',
                description: 'Necessário para receber pagamentos futuros.',
                isCompleted: !!user.pix_key,
                action: '/perfil'
            },
            {
                id: 'budget',
                title: 'Faça seu Primeiro Orçamento',
                description: 'Crie uma proposta profissional agora.',
                // @ts-ignore - _count might not be typed in frontend User interface yet
                isCompleted: (user._count?.budgets || 0) > 0,
                action: '/orcamento'
            },
            {
                id: 'share',
                title: 'Envie via WhatsApp',
                description: 'Compartilhe um orçamento com um cliente.',
                isCompleted: localStorage.getItem('hasSharedWhatsapp') === 'true',
                action: '/orcamentos' // User needs to go there to share
            },
            {
                id: 'install_app',
                title: 'Instale o Aplicativo',
                description: 'Tenha acesso offline e mais agilidade.',
                isCompleted: isInstalled,
                action: '#install-trigger',
                tourTrigger: 'install-trigger'
            },
            {
                id: 'invite',
                title: 'Convide 5 Parceiros',
                description: 'Construa sua rede (Em Breve).',
                isCompleted: false,
                // action: '#'
            }
        ];

        setTasks(checkList);

        const completedCount = checkList.filter(t => t.isCompleted).length;
        const total = checkList.length;
        setProgress(Math.round((completedCount / total) * 100));

        // Auto Open logic: If not fully completed and haven't seen in this session?
        // Or just trigger via the Trophy button in Home.
        // Let's make it auto-open only if 0% progress? No, annoyng.
        // Let's rely on the Trigger Button mainly, but maybe open once on first login.
        const hasSeen = localStorage.getItem('jornada_seen_v1');
        if (!hasSeen) {
            setIsOpen(true);
            localStorage.setItem('jornada_seen_v1', 'true');
        }

    }, [user]);

    // Listen for trigger click from Home
    useEffect(() => {
        const trigger = document.getElementById('jornada-trigger');
        if (trigger) {
            trigger.onclick = () => setIsOpen(true);
        }
    }, [user]); // Re-attach if user changes which might rerender Home

    const startTour = () => {
        setIsOpen(false);
        // Wait for modal to close (animation)
        setTimeout(() => {
            const driverObj = driver({
                showProgress: true,
                steps: [
                    { popover: { title: 'Bem-vindo ao Portal! ⚡', description: 'Aqui é seu novo escritório digital. Vamos dar uma volta?' } },
                    { element: 'header', popover: { title: 'Menu Superior', description: 'Configure seu perfil, veja notificações e acesse ajuda.' } },
                    { element: '.grid', popover: { title: 'Seus Apps', description: 'Acesse rapidamente orçamentos, catálogo e ferramentas.' } },
                    { element: '#jornada-trigger', popover: { title: 'Sua Jornada', description: 'Acompanhe seu nível profissional e conquistas.' } }
                ]
            });
            driverObj.drive();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <Trophy size={28} className="text-yellow-300" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Jornada do Eletricista</h2>
                                <p className="text-blue-100 text-sm">Nível Iniciante</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 opacity-90">
                            <span>Progresso</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-400 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${task.isCompleted
                                    ? 'bg-green-50 border-green-100'
                                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                                    }`}
                            >
                                <div className="mt-1">
                                    {task.isCompleted ? (
                                        <CheckCircle2 className="text-green-500" size={24} />
                                    ) : (
                                        <Circle className="text-gray-300" size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold ${task.isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                                        {task.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-2">
                                        {task.description}
                                    </p>
                                    {!task.isCompleted && (task.action || task.tourTrigger) && (
                                        <button
                                            onClick={(e) => {
                                                if (task.action === '#install-trigger') {
                                                    triggerInstall();
                                                    setIsOpen(false);
                                                } else if (task.action) {
                                                    // For links, we might want to let Link handle it or router push?
                                                    // But we are inside a button now?
                                                    // Let's revert to Link for non-install
                                                }
                                            }}
                                            className="inline-flex items-center text-sm font-bold text-blue-600 hover:underline"
                                        >
                                            {task.action === '#install-trigger' ? (
                                                <span className="flex items-center gap-1">Instalar Agora <ChevronRight size={16} /></span>
                                            ) : (
                                                <Link href={task.action || '#'} onClick={() => setIsOpen(false)} className="flex items-center gap-1">
                                                    Vamos lá <ChevronRight size={16} />
                                                </Link>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>


                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                    <button
                        onClick={startTour}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm"
                    >
                        <PlayCircle size={18} />
                        Iniciar Tour Guiado pela Plataforma
                    </button>
                </div>
            </div>
        </div>
    );
}
