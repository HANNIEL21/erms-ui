import http from "./http";


export interface AuthResponse<TUser = any> {
    status: number
    access_token: string
    refresh_token: string
    user: TUser
    message?: string
}

export interface LogoutResponse {
    success: boolean;
    message: string;
};

export interface PaginatedResponse<T> {
    data: T[]
    meta?: {
        page: number
        limit: number
        total: number
    }
}


/*
==========================
Auth
==========================
*/

export const LoginUser = async (
    payload: { email: string; password: string }
): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>(
        "/auth/login/user",
        payload
    )

    return response.data
}

export const LoginAlumni = async (
    payload: { matric_number: string }
): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>(
        "/auth/login/alumni",
        payload
    )

    return response.data
}

export const logout = async (
    accessToken: string,
    user: any
): Promise<LogoutResponse> => {
    const response = await http.post(
        "auth/logout",
        { user },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    return response.data;
};


/*
==========================
Roles
==========================
*/

export interface Role {
    id: string
    name: string
    createdAt: string
    _count: {
        users: number
    }
}

export const createRole = async (payload: {
    name: string;
}) => {
    const { data } = await http.post("/role", payload);
    return data;
}

export const getRoles = async (params: string): Promise<PaginatedResponse<Role>> => {
    const { data } = await http.get(`/role?${params}`);
    return data;
}


/*
==========================
Admins 
==========================
*/

export interface Admin {
    id: string
    firstname: string
    lastname: string
    email: string
    role: { name: string }
    isActive: boolean
}

export const createUser = async (payload: {
    firstname: string;
    lastname: string;
    roleId: number;
    email: string;
    password: string;
}) => {
    const { data } = await http.post("/user", payload);
    return data;
}

export const getAdmins = async (params: string): Promise<PaginatedResponse<Admin>> => {
    const { data } = await http.get(`/user?${params}`);
    return data;
}


/*
==========================
Users 
==========================
*/

export interface User {
    id: string
    firstname: string
    lastname: string
    email: string
    isActive: boolean
    _count: {
        requests: number
    }
}

export const getUsers = async (params: string): Promise<PaginatedResponse<User>> => {
    const { data } = await http.get(`/alumni?${params}`);
    return data;
}



/*
==========================
Documents
==========================
*/

export interface Document {
    id: string
    title: string
    createdBy: { email: string }
    amount: number
    totalAmount: number
    status: 'pending' | 'processing' | 'success' | 'failed'
}

export const createDocument = async (payload: {
    title: string;
    description?: string;
    status: string;
    createdById: number;
    price: number;
    processingFee: number;
    totalAmount: number;
}) => {
    const { data } = await http.post("/document", payload);
    return data;
}

export const getDocuments = async (params: string): Promise<PaginatedResponse<Document>> => {
    const { data } = await http.get(`/document?${params}`);
    return data;
}

/*
==========================
Faculty
==========================
*/

export interface Faculty {
    id: string
    name: string
    createdBy: { email: string }
    createdAt: string
    _count: {
        departments: number
    }
}

export const createFaculty = async (payload: {
    name: string;
    createdById: number;
}) => {
    const { data } = await http.post("/faculty", payload);
    return data;
}

export const getFaculties = async (params: string): Promise<PaginatedResponse<Faculty>> => {
    const { data } = await http.get(`/faculty?${params}`);
    return data;
}

/*
==========================
Department
==========================
*/

export interface Department {
    id: string
    name: string
    faculty: { name: string }
    createdBy: { email: string }
    createdAt: string
}

export const getDepartments = async (params: string): Promise<PaginatedResponse<Department>> => {
    const { data } = await http.get(`/department?${params}`);
    return data;
}

/*
==========================
Requests
==========================
*/

export interface Request {
    id: number
    status: string
    reference_number: string
    type: string
    user: {
        id: number
        matric_number: string
        email: string
    }
    document: {
        id: number
        title: string
        totalAmount: number
    }
    payments: {
        id: string
        status: string
        reference: string
    }[]
    createdAt: string
}

export const createRequests = async (payload: {
    paymentId: string;
    userId: number;
    documentId: number;
    type: string
    destination?: string;
    email?: string;
}) => {
    const { data } = await http.post("/request", payload);
    return data;
}

export const getRequests = async (params: string): Promise<PaginatedResponse<Request>> => {
    const { data } = await http.get(`/request?${params}`);
    return data;
}

export const getRequestsByUser = async (userId: number): Promise<PaginatedResponse<Request>> => {
    const { data } = await http.get(`/request/user/${userId}`);
    return data;
}

/*
==========================
Combo
==========================
*/

export interface Combo {
    id: number
    firstname: string
    middlename: string
    lastname: string
    email: string
    phone_number: string
    matric_number: string
    isPrinted: boolean
    createdAt: string
}

export const createCombo = async (payload: {
    firstname: string
    middlename?: string
    lastname: string
    email: string
    phone_number?: string
    matric_number: string
    createdById: number
    isPrinted: boolean
}) => {
    const { data } = await http.post("/combo", payload);
    return data;
}

export const getCombos = async (params: string): Promise<PaginatedResponse<Combo>> => {
    const { data } = await http.get(`/combo?${params}`);
    return data;
}

export const checkPrintStatus = async (params: string) => {
    const { data } = await http.get(`/combo/user?matric=${params}`);
    return data;
}

export const updatePrintStatus = async (payload: {
    matric: string,
    isPrinted: boolean
}) => {
    const { data } = await http.patch('/combo/user/print', payload);
    return data;
};


/*
==========================
Payments
==========================
*/
export interface Payment {
    id: string
    email: string
    status: string
    reference: string
    transaction_id: string
    totalAmount: number
    user: {
        id: number
        matric_number: string
        email: string
    }
    createdAt: string

}

export const getPayments = async (params: string): Promise<PaginatedResponse<Payment>> => {
    const { data } = await http.get(`/payment?${params}`);
    return data;
}

export const getPaymentsByUser = async (userId: number): Promise<PaginatedResponse<Payment>> => {
    const { data } = await http.get(`/payment/user/${userId}`);
    return data;
}

export const initPayment = async (payload: {
    request: string;
    type?: string;
    destination?: string;
    price: number;
    processing_fee: number;
    document?: any;
    user: any;
}) => {
    const { data } = await http.post("/payment/init", payload);
    return data;
};

export const updatePayment = async (
    id: number,
    payload: Partial<{
        transaction_id: string;
        reference: string;
        access_code: string;
        gateway_response: any;
        status: string;
        email: string;
    }>
) => {
    const { data } = await http.patch(`/payment/${id}`, payload);
    return data;
};

/*
==========================
Templates
==========================
*/

export interface Template {
    id: string
    name: string
    version: string
    isActive: boolean
    document: { id: number, title: string }
    createdBy: { id: number, email: string }
    createdAt: string
}

export const createTemplate = async (payload: {
    name: string;
    description?: string;
    version: string;
    isActive: boolean;
    createdById: number;
    documentId: number;
}) => {
    const { data } = await http.post("/template", payload);
    return data;
}

export const getTemplates = async (params: string): Promise<PaginatedResponse<Template>> => {
    const { data } = await http.get(`/template?${params}`);
    return data;
}

/*
==========================
Components
==========================
*/

export interface Components {
    id: string
    name: string
    layoutType: string
    createdAt: string
    createdBy: { id: number, email: string }
    _count: { blocks: number }
}

export const createComponent = async (payload: {
    name: string;
    layoutType: string;
    description?: string;
    createdById: number;
}) => {
    const { data } = await http.post("/components", payload);
    return data;
}

export const getComponents = async (params: string): Promise<PaginatedResponse<Components>> => {
    const { data } = await http.get(`/components?${params}`);
    return data;
}

export const getComponent = async (id: number) => {
    const { data } = await http.get(`/components/${id}`);
    return data;
}

export const addBlocks = async (
    componentId: number,
    payload: {
        blocks: {
            blockId: number
            position: number
        }[]
    }
) => {
    const { data } = await http.post(
        `/components/${componentId}/blocks`,
        payload
    )
    return data
}


/*
==========================
Block
==========================
*/

export interface Block {
    id: string
    name: string
    blockType: string
    defaultValue: string
    isDynamic: boolean
    createdAt: string
    createdBy: { id: number, email: string }
}

export const createBlock = async (payload: {
    name: string;
    blockType: string;
    defaultValue?: string;
    isDynamic?: boolean;
    createdById: number;
}) => {
    const { data } = await http.post("/block", payload);
    return data;
}

export const editBlock = async (id: number, payload: {
    name: string;
    blockType: string;
    defaultValue?: string;
    isDynamic?: boolean;
    createdById: number;
}) => {
    const { data } = await http.patch(`/block/${id}`, payload);
    return data;
}

export const getBlocks = async (params: string): Promise<PaginatedResponse<Components>> => {
    const { data } = await http.get(`/block?${params}`);
    return data;
}