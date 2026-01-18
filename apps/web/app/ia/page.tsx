'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Zap, User, Bot, Loader2, Mic, Image as ImageIcon, X } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import api from '@/lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
    audioUrl?: string;
}

export default function IAPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Olá! Sou o assistente oficial e Eletricista Sênior do Portal. Posso ajudar com dúvidas técnicas ou te ensinar a usar o app. O que manda hoje?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Multimedia states
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [tempAudioUrl, setTempAudioUrl] = useState('');
    const [tempImageUrl, setTempImageUrl] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, tempAudioUrl, tempImageUrl]);

    // Audio Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                await handleUpload(blob, 'audio');
                setIsRecording(false);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Erro ao acessar microfone:', err);
            alert('Não foi possível acessar o microfone.');
        }
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
    };

    // File Logic
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            await handleUpload(file, 'image');
        } else {
            alert('Apenas imagens são permitidas por enquanto.');
        }
    };

    const handleUpload = async (blob: Blob, type: 'audio' | 'image') => {
        const formData = new FormData();
        const ext = type === 'audio' ? 'webm' : 'jpg';
        formData.append('file', blob, `upload.${ext}`);

        try {
            setIsLoading(true);
            const { data } = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (type === 'audio') setTempAudioUrl(data.url);
            if (type === 'image') setTempImageUrl(data.url);
        } catch (error) {
            console.error('Upload failed', error);
            alert('Falha no upload.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearMedia = () => {
        setTempAudioUrl('');
        setTempImageUrl('');
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!input.trim() && !tempAudioUrl && !tempImageUrl) || isLoading) return;

        const userMsg = input.trim();
        const currentAudio = tempAudioUrl;
        const currentImage = tempImageUrl;

        // Optimistic Update
        const newMessage: Message = {
            role: 'user',
            content: userMsg,
            audioUrl: currentAudio,
            imageUrl: currentImage
        };

        setMessages(prev => [...prev, newMessage]);

        // Reset Inputs
        setInput('');
        clearMedia();
        setIsLoading(true);

        try {
            const { data } = await api.post('/assistant/chat', {
                message: userMsg,
                audioUrl: currentAudio,
                imageUrl: currentImage
            });
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Ops, tive um curto-circuito aqui. Tente novamente.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-center border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-2 rounded-full text-white">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 leading-tight">Eletricista GPT</h1>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Bot size={18} />
                            </div>
                        )}

                        <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                            {/* Render Image */}
                            {msg.imageUrl && (
                                <div className="rounded-xl overflow-hidden border border-gray-200 w-48">
                                    <img src={msg.imageUrl} alt="Anexo" className="w-full h-auto object-cover" />
                                </div>
                            )}

                            {/* Render Audio Player */}
                            {msg.audioUrl && (
                                <div className={`p-2 rounded-xl flex items-center gap-2 ${msg.role === 'user' ? 'bg-blue-700' : 'bg-gray-200'}`}>
                                    <audio controls src={msg.audioUrl} className="h-8 w-48" />
                                </div>
                            )}

                            {(msg.content || (!msg.audioUrl && !msg.imageUrl)) && (
                                <div className={`
                                    p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                    ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }
                                `}>
                                    <div
                                        style={{ whiteSpace: 'pre-wrap' }}
                                        dangerouslySetInnerHTML={{
                                            __html: msg.content.replace(
                                                /\[([^\]]+)\]\(([^)]+)\)/g,
                                                '<a href="$2" class="underline font-bold hover:text-blue-800" target="_self">$1</a>'
                                            )
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                <User size={18} />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Bot size={18} />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="fixed bottom-[80px] left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-20">
                <div className="max-w-md mx-auto space-y-2">
                    {/* Media Previews */}
                    {(tempImageUrl || tempAudioUrl) && (
                        <div className="flex gap-2 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200 items-center">
                            {tempImageUrl && (
                                <div className="relative w-16 h-16 rounded overflow-hidden">
                                    <img src={tempImageUrl} className="w-full h-full object-cover" />
                                </div>
                            )}
                            {tempAudioUrl && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border">
                                    <Mic size={16} /> Áudio gravado
                                </div>
                            )}
                            <button onClick={clearMedia} className="ml-auto p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2 items-end">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="p-3 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ImageIcon size={24} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        <div className="flex-1 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Digite ou grave..."
                                rows={1}
                                className="w-full bg-gray-100 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder-gray-500 resize-none max-h-32"
                            />
                        </div>

                        {input.trim() || tempImageUrl || tempAudioUrl ? (
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-full transition-transform active:scale-95 shadow-lg shadow-blue-200"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                            </button>
                        ) : (
                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                className={`p-3 rounded-full transition-transform active:scale-95 shadow-lg ${isRecording
                                        ? 'bg-red-500 text-white animate-pulse shadow-red-300 scale-110'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                    }`}
                            >
                                <Mic size={24} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
