'use client';

import { useState, useEffect } from 'react';
import { X, Check, ChevronRight, ChevronLeft, Lightbulb, Map, MessageSquare, Rocket, Trophy, Zap, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        // Check if user has seen onboarding
        const hasSeen = localStorage.getItem('hasSeenOnboarding_v1');
        if (!hasSeen) {
            // Small delay to appear after page load
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = (complete = false) => {
        setIsOpen(false);
        if (complete) {
            localStorage.setItem('hasSeenOnboarding_v1', 'true');
        }
    };

    const steps = [
        {
            title: "Sua Nova Identidade Profissional",
            content: "Você acaba de criar muito mais que uma conta. Agora você tem uma página exclusiva no PortalElétricos para divulgar seu trabalho, ser encontrado no Google e fechar mais negócios.",
            icon: <User size={48} className="text-blue-600 mb-4" />,
            image: null
        },
        {
            title: "Ranqueamento e Visibilidade",
            content: (
                <div className="text-sm space-y-3">
                    <p>Quanto mais completo seu perfil, mais destaque você ganha!</p>
                    <ul className="space-y-2 text-left bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <li className="flex gap-2 items-center text-gray-700">
                            <Trophy size={16} className="text-yellow-500" />
                            <span><strong>Complete seu Perfil:</strong> Adicione foto, bio e cidade.</span>
                        </li>
                        <li className="flex gap-2 items-center text-gray-700">
                            <Zap size={16} className="text-blue-500" />
                            <span><strong>Seja Visto:</strong> Clientes buscam eletricistas por região.</span>
                        </li>
                    </ul>
                </div>
            ),
            icon: <Trophy size={48} className="text-yellow-500 mb-4" />
        },
        {
            title: "Core: Orçamentos & Catálogo",
            content: (
                <ul className="text-sm space-y-2 text-left">
                    <li className="flex gap-2 items-start">
                        <span className="text-green-500 font-bold">✓</span>
                        <span><b>Orçamentos em PDF:</b> Crie propostas profissionais em segundos e envie por WhatsApp.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                        <span className="text-green-500 font-bold">✓</span>
                        <span><b>Catálogo Atualizado:</b> Consulte preços médios de materiais para não errar no orçamento.</span>
                    </li>
                </ul>
            ),
            icon: <Rocket size={48} className="text-green-600 mb-4" />
        },
        {
            title: "Ferramentas Técnicas",
            content: "Tenha no bolso calculadoras essenciais para o dia a dia: Dimensionamento de Cabos, Queda de Tensão e muito mais. Tudo para garantir a segurança e eficiência dos seus projetos.",
            icon: <Zap size={48} className="text-orange-500 mb-4" />
        },
        {
            title: "Vamos Começar?",
            content: "Seu primeiro passo é deixar seu perfil impecável. Clique abaixo e preencha suas informações para começar a subir no ranking!",
            icon: <Check size={48} className="text-green-600 mb-4" />
        }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 transition-all">
                {/* Header Image/Pattern */}
                <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%">
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-lg relative z-10 animate-bounce-slow">
                        {steps[step].icon}
                    </div>
                    <button
                        onClick={() => handleClose(true)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        title="Fechar tutorial"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{steps[step].title}</h2>
                    <div className="text-gray-600 mb-8 min-h-[100px] flex flex-col justify-center">
                        {steps[step].content}
                    </div>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-blue-600' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        {step > 0 ? (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex-1"
                            >
                                Voltar
                            </button>
                        ) : (
                            <button
                                onClick={() => handleClose(true)}
                                className="px-6 py-3 border border-gray-300 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Pular
                            </button>
                        )}

                        {step < steps.length - 1 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 flex-[2] shadow-lg shadow-blue-200"
                            >
                                Próximo
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={() => handleClose(true)}
                                className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 flex-[2] shadow-lg shadow-green-200"
                            >
                                Começar!
                                <Check size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add a custom animation to tailwind config if needed, or just standard animate-bounce
