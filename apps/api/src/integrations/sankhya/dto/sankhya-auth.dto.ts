export interface SankhyaAuthRequest {
    serviceName: 'MobileLoginSP.login';
    requestBody: {
        NOMUSU: string;
        INTERNO: string;
    };
}

export interface SankhyaAuthResponse {
    responseBody: {
        jsessionid: string;
        idusu: number;
    };
}

export interface SankhyaSession {
    jsessionid: string;
    idusu: number;
    expiresAt: Date;
}
