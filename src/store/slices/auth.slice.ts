import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus =
    | "loading"
    | "authenticated"
    | "unauthenticated";

export interface AuthUser {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    isActive: boolean;
    last_login: string;
    role: {
        id: number;
        name: string;
    };
}

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    status: AuthStatus;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    status: "unauthenticated",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (
            state,
            action: PayloadAction<{
                user: AuthUser;
                access_token: string;
                refresh_token: string;
            }>
        ) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.access_token;
            state.refreshToken = action.payload.refresh_token;
            state.status = "authenticated";
        },

        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.status = "unauthenticated";
        },

        setStatus: (
            state,
            action: PayloadAction<AuthStatus>
        ) => {
            state.status = action.payload;
        },
    },
});

export const {
    setAuth,
    logout,
    setStatus,
} = authSlice.actions;

export default authSlice.reducer;
