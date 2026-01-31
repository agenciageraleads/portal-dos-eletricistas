export interface EvolutionProfilePictureResponse {
    wuid: string;
    profilePictureUrl: string;
}

export interface EvolutionCheckNumberResponse {
    exists: boolean;
    jid?: string;
    number?: string;
}
