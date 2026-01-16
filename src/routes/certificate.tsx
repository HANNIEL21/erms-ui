import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { checkPrintStatus } from '@/service'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRightIcon, CircleCheck, Clipboard, OctagonX, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

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
    const [result, setResult] = useState<PrintStatus | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    const createForm = useForm<CheckStatusForm>({
        defaultValues: {
            matric: ''
        }
    })

    const onCreate = async (values: CheckStatusForm) => {
        const res = await checkPrintStatus(values.matric);



        // Normalize backend response
        if (res.status === 200) {
            setResult({
                status: 200,
                isPrinted: res.data.isPrinted,
            });
        } else {
            setResult({ status: res.status });
        }

        setShowPopup(true);
    };

    return (
        <div className='grid grid-cols-2 place-content-center p-8 h-screen'>
            <div className='grid place-content-center gap-6'>
                <div className='grid gap-3'>
                    <h1 className='w-20 text-blue-900 font-extrabold text-7xl'>Certificate Print Status</h1>
                    <p>Want to know if your certificate has been printed?</p>
                </div>

                <form className='flex' onSubmit={createForm.handleSubmit(onCreate)}>
                    <Input
                        placeholder='Enter Matric Number'
                        id='matric'
                        className='rounded-r-none'
                        {...createForm.register('matric', {
                            required: 'Matric Number is required',
                        })}
                    />
                    <Button className='rounded-l-none bg-blue-900 font-bold uppercase'>Check</Button>
                </form>

                <button
                    className="flex items-center gap-3 group hover:bg-accent transition-colors p-3 rounded-lg"
                >
                    <span className="group-hover:underline">
                        Apply for Reprint of Certificate
                    </span>
                    <span className="p-2 bg-green-700 rounded-full shrink-0">
                        <ArrowRightIcon className="text-primary-foreground w-4 h-4" />
                    </span>
                </button>
            </div>
            <div className='grid place-content-center'>
                <img
                    src="/certificate.png"
                    alt="Description"
                    className="mx-auto size-50 md:size-80"
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
