export const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // Ensure we don't double slash
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333').replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${path}`;
};

export const formatCurrency = (value: number | string) => {
    const val = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(val || 0);
};
