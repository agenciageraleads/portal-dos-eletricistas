'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface ImageCropModalProps {
    imageSrc: string;
    onSave: (croppedImage: Blob) => void;
    onCancel: () => void;
}

export default function ImageCropModal({ imageSrc, onSave, onCancel }: ImageCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImage) {
            onSave(croppedImage);
        }
    };

    // Manual position adjustment
    const adjustPosition = (direction: 'up' | 'down' | 'left' | 'right') => {
        const step = 10; // pixels to move
        setCrop(prev => {
            switch (direction) {
                case 'up':
                    return { ...prev, y: prev.y - step };
                case 'down':
                    return { ...prev, y: prev.y + step };
                case 'left':
                    return { ...prev, x: prev.x - step };
                case 'right':
                    return { ...prev, x: prev.x + step };
                default:
                    return prev;
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <h3 className="font-bold text-lg">Ajustar Logo</h3>
                    <button onClick={onCancel} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Cropper */}
                <div className="relative h-96 bg-white">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        cropShape="round"
                        showGrid={false}
                        restrictPosition={false}
                        style={{
                            containerStyle: {
                                background: '#ffffff'
                            }
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="p-6 bg-gray-50 space-y-4">
                    {/* Position Controls */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Posição</label>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => adjustPosition('up')}
                                className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
                            >
                                <ArrowUp size={20} className="text-gray-700" />
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => adjustPosition('left')}
                                    className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-gray-700" />
                                </button>
                                <button
                                    onClick={() => adjustPosition('down')}
                                    className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
                                >
                                    <ArrowDown size={20} className="text-gray-700" />
                                </button>
                                <button
                                    onClick={() => adjustPosition('right')}
                                    className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
                                >
                                    <ArrowRight size={20} className="text-gray-700" />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Use as setas para centralizar a imagem
                        </p>
                    </div>

                    {/* Zoom Control */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Zoom</label>
                        <div className="flex items-center gap-4">
                            <ZoomOut size={20} className="text-gray-600 flex-shrink-0" />
                            <input
                                type="range"
                                min={0.5}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <ZoomIn size={20} className="text-gray-600 flex-shrink-0" />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">
                            {zoom.toFixed(1)}x
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        <Check size={20} />
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper function to create cropped image - Always use WEBP (most efficient)
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: any
): Promise<Blob | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const size = 512; // Output size (512x512 for logos)
    canvas.width = size;
    canvas.height = size;

    // Fill with white background (important for zoom out)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Calculate scaling to fit cropped area into canvas
    const scale = size / Math.max(pixelCrop.width, pixelCrop.height);

    // Center the image if it's smaller than canvas
    const offsetX = (size - pixelCrop.width * scale) / 2;
    const offsetY = (size - pixelCrop.height * scale) / 2;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        offsetX,
        offsetY,
        pixelCrop.width * scale,
        pixelCrop.height * scale
    );

    // Use JPEG for maximum compatibility on iOS
    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                resolve(blob);
            },
            'image/jpeg',
            0.9
        );
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        // image.setAttribute('crossOrigin', 'anonymous'); // Removed to prevent Issues with Data URIs on iOS
        image.src = url;
    });
}
