'use client';

import { useState, useEffect } from 'react';

export default function DownloadApkPage() {
    const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
    // Aponta para o arquivo APK copiado na pasta public do Next.js
    const apkDownloadUrl = '/Portal_Eletricos.apk';

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setActiveTab('ios');
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4">
            <div className="max-w-md w-full text-center">
                {/* Logo / Badge */}
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-amber-500/10 mx-auto mb-6 border border-amber-300">
                    ⚡
                </div>

                <h1 className="text-3xl font-extrabold text-slate-100">
                    Portal dos Eletricistas
                </h1>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    Instale o Portal em seu celular e tenha acesso ultra-rápido a orçamentos, catálogo inteligente e comissões do Sankhya!
                </p>

                {/* Seletor de Sistema */}
                <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-inner mt-8 w-full">
                    <button
                        onClick={() => setActiveTab('android')}
                        className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                            activeTab === 'android'
                                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        🤖 Celular Android
                    </button>
                    <button
                        onClick={() => setActiveTab('ios')}
                        className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                            activeTab === 'ios'
                                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        🍎 Celular iPhone (iOS)
                    </button>
                </div>

                {activeTab === 'android' ? (
                    <>
                        {/* SEÇÃO ANDROID */}
                        <div className="mt-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                            <a
                                href={apkDownloadUrl}
                                download="Portal_Eletricos.apk"
                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-amber-500/10 flex items-center justify-center gap-3 active:scale-95"
                            >
                                <span>📥</span> Baixar para Android (APK)
                            </a>
                            <p className="text-[10px] text-slate-500 mt-3 font-semibold">
                                Versão 1.5.2 | Tamanho: ~63 MB | Compatível com Android 8.0+
                            </p>
                        </div>

                        {/* Passo a Passo Android */}
                        <div className="mt-10 text-left">
                            <h2 className="font-extrabold text-sm uppercase tracking-wider text-amber-400 mb-6 text-center">
                                Instruções de Instalação (Android)
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="flex gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/85">
                                    <div className="w-8 h-8 shrink-0 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black text-sm">1</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-200">Faça o Download</h3>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Clique no botão de download acima. Se surgir um alerta padrão sobre arquivo nocivo, clique em <strong>"Fazer o download mesmo assim"</strong> (aviso genérico do Android para apps instalados fora da Play Store).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/85">
                                    <div className="w-8 h-8 shrink-0 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black text-sm">2</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-200">Abra o APK</h3>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Quando terminar, clique em <strong>"Abrir"</strong> na notificação do Chrome ou acesse seus arquivos de Downloads e clique em <strong>"Portal_Eletricos.apk"</strong>.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/85">
                                    <div className="w-8 h-8 shrink-0 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black text-sm">3</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-200">Permita a Instalação</h3>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Caso apareça bloqueio do sistema, clique em <strong>"Configurações"</strong> e ative <strong>"Permitir desta fonte"</strong> para o navegador correspondente. Depois clique em <strong>"Instalar"</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* SEÇÃO IOS (IPHONE) */}
                        <div className="mt-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl text-center">
                            <span className="text-4xl block mb-2">📲</span>
                            <p className="text-sm font-bold text-slate-200">Adicionar à Tela de Início</p>
                            <p className="text-xs text-slate-400 mt-2">
                                No iOS, o aplicativo é executado de forma ultra-rápida como Web App oficial PWA através do navegador Safari.
                            </p>
                        </div>

                        {/* Passo a Passo iOS */}
                        <div className="mt-10 text-left">
                            <h2 className="font-extrabold text-sm uppercase tracking-wider text-amber-400 mb-6 text-center">
                                Instruções de Instalação (iPhone)
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="flex gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/85">
                                    <div className="w-8 h-8 shrink-0 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black text-sm">1</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-200">Abra no Safari</h3>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Certifique-se de que você está acessando este link pelo navegador oficial do iPhone, o **Safari**.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/85">
                                    <div className="w-8 h-8 shrink-0 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black text-sm">2</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-200">Toque em Compartilhar</h3>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Pressione o botão **Compartilhar** <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Ios_share_icon.svg" className="inline w-3.5 h-3.5 mx-1 invert opacity-80" alt="Compartilhar" /> (ícone de quadrado com seta para cima) na barra inferior do Safari.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/85">
                                    <div className="w-8 h-8 shrink-0 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black text-sm">3</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-200">Adicionar à Tela de Início</h3>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Role o menu de opções para cima e toque em <strong>"Adicionar à Tela de Início"</strong>. Confirme clicando em **Adicionar** no canto superior direito. Pronto! O app estará na tela do seu iPhone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Footer Informativo */}
                <p className="text-[10px] text-slate-600 mt-12 mb-6">
                    Mantido e disponibilizado de forma segura pela Portal Distribuidora.
                </p>
            </div>
        </div>
    );
}
