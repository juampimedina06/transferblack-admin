export interface DriverDocument {
  id: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  filePath: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface VehicleDocument {
  id: string;
  vehicleId?: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  filePath: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface DriverVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  status: string;
}

export interface DriverMeeting {
  id: string;
  status: 'proposed' | 'confirmed' | 'reschedule_requested' | 'completed' | 'no_show' | 'cancelled';
  scheduledAt: string;
  location: string;
  adminNotes?: string;
}

export interface DriverDetailResponse {
  driverProfile: {
    id: string;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
    availabilityStatus?: string;
    rejectionReason?: string | null;
    approvedAt?: string | null;
    approvedBy?: string | null;
    ratingAverage?: number;
    ratingCount?: number;
    createdAt?: string;
  };
  personalData: {
    fullName: string;
    phoneE164: string;
    birthDate?: string;
    documentType?: string;
    documentNumber: string;
    addressText?: string;
    email?: string; // fallback in case it exists later
  };
  vehicles: DriverVehicle[];
  driverDocuments: DriverDocument[];
  vehicleDocuments: VehicleDocument[];
  latestMeeting?: DriverMeeting | null;
}
