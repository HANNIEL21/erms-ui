import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { checkPrintStatus, initPayment, logout, updatePayment } from '@/service'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRightIcon, ChevronDown, CircleCheck, Clipboard, Home, LogOut, OctagonX, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import PaystackPop from "@paystack/inline-js"
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout as logoutAction } from '@/store/slices/auth.slice';
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type CheckStatusForm = {
    matric: string
}

interface PrintStatus {
    status: number;
    isPrinted?: boolean;
}

export const Route = createFileRoute('/certificate')({
    component: RouteComponent,
})



function RouteComponent() {
    const { user, accessToken } = useAppSelector((state) => state.auth)
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [result, setResult] = useState<PrintStatus | null>(null);
    const [paymentData, setPaymentData] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPopup, setShowPopup] = useState(false);

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

    const createForm = useForm<CheckStatusForm>({
        defaultValues: {
            matric: ''
        }
    })

    const onCreate = async (values: CheckStatusForm) => {
        if (paymentData) {
            handlePayment(values.matric)
            return
        }

        if (!user) {
            toast.error('Please login to proceed');
        }

        try {
            setLoading(true)

            const payload = {
                user,
                type: 'CERTIFICATE STATUS CHECK',
                request: 'CERTIFICATE_PRINT_STATUS',
                price: 2000,
                processing_fee: 500,
            }

            const response = await initPayment(payload)
            setPaymentData(response)

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handlePayment = async (matric: string) => {
        if (!paymentData?.access_code || !paymentData.payment_id) return

        const paystack = new PaystackPop()

        paystack.resumeTransaction(paymentData.access_code, {
            onSuccess: async () => {
                try {
                    await updatePayment(paymentData.payment_id, {
                        status: "SUCCESSFUL",
                        transaction_id: paymentData.reference,
                        reference: paymentData.reference,
                        access_code: paymentData.access_code,
                    })

                    const res = await checkPrintStatus(matric)

                    if (res.status === 200) {
                        setResult({
                            status: 200,
                            isPrinted: res.data.isPrinted,
                        })
                    } else {
                        setResult({ status: res.status })
                    }

                    setShowPopup(true)
                    setPaymentData(null)
                } catch (err) {
                    console.error(err)
                }
            },
        })
    }





    return (
        <div className="relative grid lg:grid-cols-2 min-h-screen px-4 sm:px-8 py-6 lg:py-12 overflow-x-hidden">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-wrap gap-2 justify-end z-10">
                {user && user?.role ? (
                    <div className='flex items-center gap-4'>
                        <Button
                            className='bg-blue-900 hover:bg-blue-800'
                            size='icon'
                            onClick={() => navigate({ to: '/' })}
                        >
                            <Home />
                        </Button>
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

            <div className="flex flex-col justify-center gap-8 max-w-xl mx-auto text-center lg:text-left">

                <div className='grid gap-3'>
                    <h1 className="text-blue-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight">
                        Certificate Print Status</h1>
                    <p>Want to know if your certificate has been printed?</p>
                </div>

                <form
                    className="flex w-full max-w-md mx-auto lg:mx-0 gap-0"
                    onSubmit={createForm.handleSubmit(onCreate)}
                >
                    <Input
                        placeholder='Enter Matric Number'
                        id='matric'
                        className="rounded-r-none h-12 text-base"
                        {...createForm.register('matric', {
                            required: 'Matric Number is required',
                        })}
                    />
                    { }
                    <Button
                        type="submit"
                        className="rounded-l-none bg-blue-900 font-bold uppercase h-12 px-6 transition-colors disabled:opacity-60"
                        disabled={loading}
                    >
                        {paymentData ? 'Complete Payment' : 'Check'}
                    </Button>

                </form>

                <button
                    className="flex items-center justify-between gap-3 p-4 rounded-lg border border-transparent hover:border-accent hover:bg-accent/40 transition-all cursor-pointer max-w-md mx-auto lg:mx-0"
                >
                    <span className="group-hover:underline">
                        Apply for Reprint of Certificate
                    </span>
                    <span className="p-2 bg-green-700 rounded-full shrink-0">
                        <ArrowRightIcon className="text-primary-foreground w-4 h-4" />
                    </span>
                </button>
            </div>
            <div className="hidden lg:flex items-center justify-center">
                <img
                    src="/certificate.png"
                    alt="Description"
                    className="max-w-sm xl:max-w-md w-full h-auto"
                />
            </div>

            {showPopup && result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop with fade-in animation */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setShowPopup(false)}
                    />

                    {/* Modal with slide-up animation */}
                    <div className="relative w-full max-w-md transform transition-all duration-300 ease-out scale-100 opacity-100">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-8">
                                {/* Icon with background circle */}
                                <div className="flex justify-center mb-6">
                                    {/* 404 → Contact ICT */}
                                    {result?.status === 404 && (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse-slow" />
                                            <div className="relative p-4">
                                                <OctagonX className="stroke-red-600 size-16" />
                                            </div>
                                        </div>
                                    )}

                                    {/* 200 + NOT printed */}
                                    {result?.status === 200 && result.isPrinted === false && (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-amber-100 rounded-full" />
                                            <div className="relative p-4">
                                                <TriangleAlert className="stroke-amber-600 size-16" />
                                            </div>
                                        </div>
                                    )}

                                    {/* 200 + printed */}
                                    {result?.status === 200 && result.isPrinted === true && (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse-slow" />
                                            <div className="relative p-4">
                                                <CircleCheck className="stroke-green-600 size-16" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div className="text-center mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {result.status === 404 && 'Action Required'}
                                        {result.status === 200 && result.isPrinted === false && 'Notice'}
                                        {result.status === 200 && result.isPrinted === true && 'Success!'}
                                    </h3>
                                </div>

                                {/* Message */}
                                <p className="text-center text-gray-600 mb-8 text-lg">
                                    {result.status === 404 && (
                                        <span>
                                            Certificate not found in system.<br />
                                            <span className="font-semibold text-red-600">Please contact ICT department</span> for assistance.
                                        </span>
                                    )}

                                    {result.status === 200 && result.isPrinted === false && (
                                        <span>
                                            Your certificate is processed but <span className="font-semibold text-amber-600">not yet printed</span>.<br />
                                            Please check back later or contact the administration office.
                                        </span>
                                    )}

                                    {result.status === 200 && result.isPrinted === true && (
                                        <span>
                                            Your certificate has been <span className="font-semibold text-green-600">successfully printed</span> and is ready for collection.
                                        </span>
                                    )}
                                </p>

                                {/* Status badge for additional context */}
                                {(result.status === 200) && (
                                    <div className="flex justify-center mb-8">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${result.isPrinted ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                            <div className={`w-2 h-2 rounded-full ${result.isPrinted ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                                            <span className="text-sm font-medium">
                                                Status: {result.isPrinted ? 'Printed' : 'Pending Print'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {result.status === 200 && result.isPrinted && (
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                                            onClick={() => {
                                                // Add copy functionality here
                                                console.log('Copy button clicked');
                                            }}
                                        >
                                            <Clipboard className="w-4 h-4 mr-2 inline" />
                                            Copy Reference ID
                                        </Button>
                                    )}

                                    <Button
                                        variant={result.status === 200 && result.isPrinted ? "outline" : "default"}
                                        className={`flex-1 font-semibold py-3 rounded-lg transition-all duration-200 ${result.status === 200 && result.isPrinted
                                            ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : result.status === 404
                                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                                                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg'
                                            }`}
                                        onClick={() => setShowPopup(false)}
                                    >
                                        {result.status === 404 ? 'Got it, will contact ICT' : 'Close'}
                                    </Button>
                                </div>

                                {/* Additional info for 404 */}
                                {result.status === 404 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 text-center">
                                            ICT Department Contact:<br />
                                            <span className="font-medium">Email: ict@example.com | Phone: (123) 456-7890</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
