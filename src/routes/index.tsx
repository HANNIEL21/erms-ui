import Triangle from '@/components/background/Triangle'
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { logout } from '@/service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/auth.slice';
import { Separator } from '@radix-ui/react-separator';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRightIcon, ChevronDown, LogOut, Star } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';

export const Route = createFileRoute('/')({
    component: Home,
})

const featureFlags = ["Request", "Verify", "Anytime", "Anywhere"];

function Home() {
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
        <div className="h-screen flex flex-col relative p-6 md:p-0">
            <div className="flex justify-end absolute right-5 md:top-5 md:right-5">
                {user && user?.role ? (
                    <div className='flex items-center gap-4'>
                        <Button
                            className="bg-green-800"
                            onClick={() => {
                                user.role.name === "ALUMNI" ? navigate({ to: "/user" }) : navigate({ to: "/admin" })
                            }}
                        >
                            Dashboard
                        </Button>

                        <Button
                            variant='destructive'
                            size='icon'
                            onClick={handleLogout}
                        >
                            <LogOut />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <Button
                            className="rounded-r-none bg-green-800"
                        >
                            Login
                        </Button>
                        <Separator orientation="vertical" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="rounded-l-none border-l-0 px-2 bg-green-800">
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => navigate({
                                    to: "/auth/login",
                                    search: { role: "admin" }
                                })}>
                                    Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => navigate({
                                    to: "/auth/login",
                                    search: { role: "alumni" }
                                })}>
                                    Alumni
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>


            <div className="flex flex-col justify-center grow mt-8 py-8">
                <img
                    src="/rsu-logo.png"
                    alt="Description"
                    className="mx-auto size-28 md:size-38"
                />
                <h1 className="text-center text-2xl md:text-4xl font-extrabold text-foreground max-w-2xl mx-auto my-8">
                    RIVERS STATE UNIVERSITY ACADEMIC RECORDS PORTAL
                </h1>
                <ul className="flex justify-center flex-wrap items-center gap-4 my-4">
                    {featureFlags.map((flag) => (
                        <Fragment key={flag}>
                            <li>
                                <Star className="fill-green-800 stroke-green-800" />
                            </li>
                            <li key={flag} className="flex items-center font-semibold gap-2">
                                {flag}
                            </li>
                        </Fragment>
                    ))}
                </ul>
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        size="lg"
                        className='bg-green-800'
                    >
                        Request Document
                    </Button>
                    <Button size="lg" variant="outline" className="border-2 border-black font-bold">
                        <Link to="/verify">
                            Verify Document
                        </Link>
                    </Button>
                </div>
                <div className="flex justify-center items-center mt-8">
                    <button
                        className="flex items-center gap-3 group hover:bg-accent transition-colors p-3 rounded-lg"
                        onClick={() => navigate({ to: "/certificate" })}
                    >
                        <span className="group-hover:underline">
                            Check certificate status
                        </span>
                        <span className="p-2 bg-primary rounded-full shrink-0">
                            <ArrowRightIcon className="text-primary-foreground w-4 h-4" />
                        </span>
                    </button>
                </div>
            </div>

            <Triangle className="hidden md:block absolute left-0 h-screen fill-green-800" />
            <Triangle className="hidden md:block absolute h-screen fill-blue-800 scale-y-[-1]" />
        </div>
    )
}