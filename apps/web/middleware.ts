import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas (não exigem login)
const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/cadastro',
    '/esqueci-senha',
    '/redefinir-senha',
    '/services', // Mural de Vagas é público para visualização
    '/ferramentas', // Calculadoras
];

// Rotas que começam com estes prefixos são públicas
const publicPrefixes = [
    '/ferramentas/',
    '/services'
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Verificar se é uma rota pública exata
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Verificar prefixos públicos
    if (publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // Verificar se é arquivo estático ou api (deixar API lidar com auth por guard)
    if (pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')) {
        return NextResponse.next();
    }

    // Verificar token (exemplo simples usando cookie)
    // O ideal é validar o token, mas no middleware é limitado.
    // Vamos verificar a presença do cookie de 'token' ou 'user_session'
    const token = request.cookies.get('token')?.value;

    if (!token) {
        // Usuário não logado tentando acessar rota protegida
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
