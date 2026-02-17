import Triangle from '@/components/background/Triangle'
import LogoutButton from '@/components/logout-button';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { logout } from '@/service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Separator } from '@radix-ui/react-separator';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRightIcon, ChevronDown, LogOut, Star, FileText, Shield, Clock, CheckCircle, Users, BookOpen } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';

export const Route = createFileRoute('/')({
    component: Home,
})

const featureFlags = ["Request", "Verify", "Anytime", "Anywhere"];

function Home() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, accessToken } = useAppSelector((state) => state.auth);

    return (
        <div className="min-h-screen flex flex-col relative bg-white">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 via-transparent to-transparent" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl" />
            
            {/* Floating Shapes */}
            <div className="absolute top-20 left-20 w-32 h-32 border-2 border-green-200/30 rounded-full animate-pulse" />
            <div className="absolute bottom-40 right-20 w-24 h-24 border-2 border-green-300/20 rotate-45 animate-[spin_20s_linear_infinite]" />
            
            {/* Navigation */}
            <div className="relative z-10 flex justify-end p-4 md:p-6">
                <div className="flex justify-end absolute right-5 md:top-5 md:right-5">
                    {user && user?.role ? (
                        <div className='flex items-center gap-4'>
                            <Button
                                className="bg-green-800 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => {
                                    user.role.name === "ALUMNI" ? navigate({ to: "/user" }) : navigate({ to: "/admin" })
                                }}
                            >
                                Dashboard
                            </Button>

                            <LogoutButton />
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Button
                                className="rounded-r-none bg-green-800 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Login
                            </Button>
                            <Separator orientation="vertical" className="h-8 w-px bg-green-600" />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="rounded-l-none border-l-0 px-2 bg-green-800 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                        <ChevronDown />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white/90 backdrop-blur-xl border-green-100">
                                    <DropdownMenuItem onSelect={() => navigate({
                                        to: "/auth/login",
                                        search: { role: "admin" }
                                    })} className="hover:bg-green-50 focus:bg-green-50">
                                        Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => navigate({
                                        to: "/auth/login",
                                        search: { role: "alumni" }
                                    })} className="hover:bg-green-50 focus:bg-green-50">
                                        Alumni
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col justify-center grow mt-8 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <img
                        src="/rsu-logo.png"
                        alt="Rivers State University Logo"
                        className="mx-auto size-28 md:size-38 animate-in fade-in duration-1000"
                    />
                    
                    <h1 className="text-center text-3xl md:text-5xl font-extrabold text-gray-900 max-w-4xl mx-auto my-8 leading-tight">
                        RIVERS STATE UNIVERSITY
                        <span className="block text-green-800 text-4xl md:text-6xl mt-2">
                            ACADEMIC RECORDS PORTAL
                        </span>
                    </h1>
                    
                    {/* Feature Flags with Enhanced Design */}
                    <div className="flex justify-center items-center gap-6 md:gap-8 my-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                        {featureFlags.map((flag, index) => (
                            <Fragment key={flag}>
                                {index > 0 && (
                                    <div className="w-1 h-1 rounded-full bg-green-300" />
                                )}
                                <div className="flex items-center gap-2">
                                    <Star className="fill-green-800 stroke-green-800 w-5 h-5" />
                                    <span className="font-semibold text-gray-700">{flag}</span>
                                </div>
                            </Fragment>
                        ))}
                    </div>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <Button
                            size="lg"
                            className='bg-green-800 hover:bg-green-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto'
                        >
                            Request Document
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="border-2 border-green-800 text-green-800 hover:bg-green-50 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                        >
                            <Link to="/verify" className="flex items-center gap-2">
                                Verify Document
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                    
                    {/* Certificate Status Link */}
                    <div className="flex justify-center items-center mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                        <button
                            className="flex items-center gap-3 group hover:bg-green-50 transition-all duration-300 p-4 rounded-xl"
                            onClick={() => navigate({ to: "/certificate" })}
                        >
                            <span className="text-gray-600 group-hover:text-green-800 transition-colors">
                                Check certificate status
                            </span>
                            <span className="p-2 bg-green-800 rounded-full group-hover:bg-green-700 group-hover:scale-110 transition-all duration-300">
                                <ArrowRightIcon className="text-white w-4 h-4" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section with Green Mesh Pattern */}
            <section className="relative z-10 py-20 bg-white">
                {/* Green Mesh Pattern Header */}
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(#22c55e_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-20" />
                
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Streamlined academic record management at your fingertips
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="w-8 h-8 text-green-800" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Document Requests</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Request transcripts, statements of results, and other academic documents instantly through our secure portal.
                                </p>
                                <div className="mt-6 flex items-center text-green-800 font-semibold">
                                    <span>Learn more</span>
                                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Shield className="w-8 h-8 text-green-800" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Blockchain Verification</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Verify certificate authenticity with our secure blockchain-backed verification system.
                                </p>
                                <div className="mt-6 flex items-center text-green-800 font-semibold">
                                    <span>Learn more</span>
                                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="w-8 h-8 text-green-800" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-time Tracking</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Track your document requests from submission to delivery with real-time status updates.
                                </p>
                                <div className="mt-6 flex items-center text-green-800 font-semibold">
                                    <span>Learn more</span>
                                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section with Green Mesh Pattern */}
            <section className="relative z-10 py-20 bg-gradient-to-b from-white to-green-50/30">
                {/* Green Mesh Pattern Header */}
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(#22c55e_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10" />
                
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center group animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-5xl font-bold text-green-800 mb-2 group-hover:scale-110 transition-transform">10K+</div>
                            <div className="text-gray-600">Active Users</div>
                        </div>
                        <div className="text-center group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <div className="text-5xl font-bold text-green-800 mb-2 group-hover:scale-110 transition-transform">50K+</div>
                            <div className="text-gray-600">Documents Processed</div>
                        </div>
                        <div className="text-center group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <div className="text-5xl font-bold text-green-800 mb-2 group-hover:scale-110 transition-transform">99.9%</div>
                            <div className="text-gray-600">Verification Accuracy</div>
                        </div>
                        <div className="text-center group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                            <div className="text-5xl font-bold text-green-800 mb-2 group-hover:scale-110 transition-transform">24/7</div>
                            <div className="text-gray-600">Support Available</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section with Green Mesh Pattern */}
            <section className="relative z-10 py-20 bg-white">
                {/* Green Mesh Pattern Header */}
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(#22c55e_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-20" />
                
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get started in three simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl">
                                1
                            </div>
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 ml-6 mt-6 hover:shadow-2xl transition-all duration-300">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <Users className="w-8 h-8 text-green-800" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Create Account</h3>
                                <p className="text-gray-600">
                                    Sign up as an alumni or admin to access the portal
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl">
                                2
                            </div>
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 ml-6 mt-6 hover:shadow-2xl transition-all duration-300">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <FileText className="w-8 h-8 text-green-800" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Request Documents</h3>
                                <p className="text-gray-600">
                                    Select and request the academic documents you need
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl">
                                3
                            </div>
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 ml-6 mt-6 hover:shadow-2xl transition-all duration-300">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="w-8 h-8 text-green-800" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Track & Receive</h3>
                                <p className="text-gray-600">
                                    Track your request status and receive verified documents
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="relative z-10 bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-lg font-bold mb-4">RSU ARP</h4>
                            <p className="text-gray-400 text-sm">
                                Rivers State University Academic Records Portal
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link to="/" className="hover:text-green-400 transition-colors">Home</Link></li>
                                <li><Link to="/verify" className="hover:text-green-400 transition-colors">Verify</Link></li>
                                <li><Link to="/certificate" className="hover:text-green-400 transition-colors">Certificate Status</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>Help Center</li>
                                <li>Contact Us</li>
                                <li>FAQs</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                        © 2024 Rivers State University. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Background Triangles (Retained from original) */}
            <Triangle className="hidden md:block absolute left-0 h-screen fill-green-800/10" />
            <Triangle className="hidden md:block absolute h-screen fill-blue-800/5 scale-y-[-1]" />
        </div>
    )
}