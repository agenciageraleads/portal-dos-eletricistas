'use client';

import { useState, useEffect } from 'react';
import { X, Check, ChevronRight, ChevronLeft, Lightbulb, Map, MessageSquare, Rocket } from 'lucide-react';
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
            title: "Bem-vindo ao Portal!",
            content: "Estamos muito felizes em ter você aqui. O Portal do Eletricista foi criado para facilitar o seu dia a dia, simplificando a criação de orçamentos e a busca por produtos.",
            icon: <Rocket size={48} className="text-blue-600 mb-4" />,
            image: null
        },
        {
            title: "O que você pode fazer hoje?",
            content: (
                <ul className="text-sm space-y-2 text-left">
                    <li className="flex gap-2 items-start">
                        <span className="text-green-500 font-bold">✓</span>
                        <span><b>Catálogo Completo:</b> Busque produtos, veja preços e detalhes técnicos.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                        <span className="text-green-500 font-bold">✓</span>
                        <span><b>Orçamentos Profissionais:</b> Crie orçamentos detalhados com materiais e mão de obra de forma rápida.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                        <span className="text-green-500 font-bold">✓</span>
                        <span><b>Compartilhe PDF:</b> Gere PDFs profissionais para enviar aos seus clientes pelo WhatsApp.</span>
                    </li>
                </ul>
            ),
            icon: <Lightbulb size={48} className="text-yellow-500 mb-4" />
        },
        {
            title: "O que vem por aí?",
            content: (
                <div className="text-sm space-y-2">
                    <p>Estamos trabalhando duro para trazer mais novidades:</p>
                    <ul className="space-y-2 text-left bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <li className="flex gap-2 items-center text-gray-700">
                            <Map size={16} className="text-blue-500" />
                            <span>Histórico de Orçamentos (Em breve)</span>
                        </li>
                        <li className="flex gap-2 items-center text-gray-700">
                            <Map size={16} className="text-purple-500" />
                            <span> Gestão de Clientes</span>
                        </li>
                        <li className="flex gap-2 items-center text-gray-700">
                            <Map size={16} className="text-green-500" />
                            <span>Link de Pagamento Integrado</span>
                        </li>
                    </ul>
                </div>
            ),
            icon: <Map size={48} className="text-purple-600 mb-4" />
        },
        {
            title: "Seu Feedback é Vital",
            content: "Construímos este portal para VOCÊ. Se encontrar erros, tiver ideias ou sentir falta de algo, clique no botão \"Alert\" no topo da página. Sua opinião guia nosso desenvolvimento!",
            icon: <MessageSquare size={48} className="text-green-500 mb-4" />
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
