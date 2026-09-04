export interface StaffOption {
    id: number;
    name: string;
    position: string;
}

export interface ExistingDocument {
    id: number;
    document_type: string;
    file_name: string;
    file_path: string;
}

export interface FormData {
    // Step 1 – Session
    consultation_stage: string;
    consultation_date: string;
    berita_acara_number: string;
    implementation_mode: string;
    location: string;
    location_other: string;
    staff_1_id: string;
    staff_2_id: string;
    staff_3_id: string;
    staff_4_id: string;

    // Step 1 – Requester & Site
    requester_name: string;
    requester_position: string;
    legal_entity_name: string;
    contact_email: string;
    permit_type: string;
    activity_type: string;
    activity_detail: string;
    activity_detail_other: string;
    kbli: string;
    province: string;
    regency: string;
    district: string;
    water_name: string;
    water_name_other: string;
    consultation_instruments: string;

    // Step 2 – "Konsultasi / Koordinasi" path only
    consultation_notes: string;

    // Step 2 – "Asistensi Dokumen" path only
    activity_category: string;
    planned_area: string;
    planned_area_unit: string;
    existing_condition: string;
    coordinate_points: string;
    owned_documents: string[];
    owned_documents_other: string;
    activity_description: string;
    surrounding_utilization: string;
    environmental_condition: string;
    other_information: string;
    consultation_result: string;
}

export const EMPTY_FORM: FormData = {
    consultation_stage: '',
    consultation_date: '',
    berita_acara_number: '',
    implementation_mode: '',
    location: '',
    location_other: '',
    staff_1_id: '',
    staff_2_id: '',
    staff_3_id: '',
    staff_4_id: '',
    requester_name: '',
    requester_position: '',
    legal_entity_name: '',
    contact_email: '',
    permit_type: '',
    activity_type: '',
    activity_detail: '',
    activity_detail_other: '',
    kbli: '',
    province: '',
    regency: '',
    district: '',
    water_name: '',
    water_name_other: '',
    consultation_instruments: '',
    consultation_notes: '',
    activity_category: '',
    planned_area: '',
    planned_area_unit: 'Ha',
    existing_condition: '',
    coordinate_points: '',
    owned_documents: [],
    owned_documents_other: '',
    activity_description: '',
    surrounding_utilization: '',
    environmental_condition: '',
    other_information: '',
    consultation_result: '',
};

export interface BeritaAcaraFormProps {
    staffList: StaffOption[];
    konsultasi?: any;
    berita_acara?: any;
    adminMode?: boolean;
}