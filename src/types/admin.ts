export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AdminStats {
  totalUsers: number;
  activeProviders: number;
  pendingKyc: number;
  commissionRevenue: number;
  currency?: string;
}

export interface KycDocument {
  url: string;
  label: string;
}

export interface KycProvider {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  avatarUrl?: string;
  status: KycStatus;
  submittedAt: string;
  documents: {
    ine: KycDocument;
    selfie: KycDocument;
    proofOfAddress: KycDocument;
  };
}