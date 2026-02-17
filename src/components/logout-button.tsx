import { logout as logoutAction } from '@/store/slices/auth.slice';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/service';

const LogoutButton = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, accessToken } = useAppSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            const res = await logout(accessToken!, user);
            console.log(res);
            dispatch(logoutAction())
            navigate({ to: "/" });
        } catch (error) {
            console.error("Logout failed:", error);
            dispatch(logoutAction());
            navigate({ to: "/" });
        }
    }

    return (
        <Button
            variant='destructive'
            size='icon'
            onClick={handleLogout}
        >
            <LogOut />
        </Button>
    )
}

export default LogoutButton