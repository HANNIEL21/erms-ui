import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query';
import { LoginAlumni, LoginUser } from '@/service';
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/auth.slice';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

const loginSchema = z
  .object({
    email: z.string(),
    password: z.string().optional(),
    role: z.enum(["admin", "alumni"]).optional(),
  })
  .superRefine((data, ctx) => {
    /** ADMIN LOGIN RULES */
    if (data.role === "admin") {
      // email must be valid email
      const emailCheck = z.string().email().safeParse(data.email);
      if (!emailCheck.success) {
        ctx.addIssue({
          path: ["email"],
          message: "Invalid email address",
          code: z.ZodIssueCode.custom,
        });
      }

      // password rules
      if (!data.password) {
        ctx.addIssue({
          path: ["password"],
          message: "Password is required for admin login",
          code: z.ZodIssueCode.custom,
        });
      } else if (data.password.length < 8) {
        ctx.addIssue({
          path: ["password"],
          message: "Password must be at least 8 characters",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    /** ALUMNI LOGIN RULES */
    if (data.role === "alumni") {
      if (!data.email || data.email.trim().length === 0) {
        ctx.addIssue({
          path: ["email"],
          message: "Matric number is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

type Role = "admin" | "alumni";

type AuthSearch = {
  role: Role;
};

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
  validateSearch: (search): AuthSearch => {
    return {
      role: (typeof search.role === "string" &&
        (search.role === "admin" || search.role === "alumni")
        ? search.role
        : "alumni") as Role,
    };
  }
})

function RouteComponent() {
  const { role } = Route.useSearch();
  const dispatch = useAppDispatch();
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  // Features data
  const features = [
    {
      title: 'Request Documents',
      description: 'Request official transcripts, statements of results, and other academic documents with just a few clicks.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Verify Certificate Status',
      description: 'Check the printing and processing status of your certificates in real-time, from request to delivery.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: 'Certificate Authenticity',
      description: 'Verify the authenticity of certificates with our secure blockchain-backed verification system.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  const isAdmin = role === "admin";

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    console.log("Login Data", data)
    mutation.mutate(data);
  }

  const mutation = useMutation({
    mutationKey: ["Login", role],
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      if (role === "admin") {
        return LoginUser({ email: data.email, password: data.password! })
      }

      return LoginAlumni({ matric_number: data.email });
    },
    onSuccess(data) {
      console.log(data);
      if (data.status === 200) {
        toast.success(`Logged in as ${data.user.email}`)

        switch (data.user?.role?.name) {
          case "Alumni":
            navigate({ to: '/user' });
            break;
          case "Super Admin":
            navigate({ to: '/dashboard' });
            break;
          case "Admin":
            navigate({ to: '/faculty' });
            break;
          case "Record Officer":
            navigate({ to: '/faculty' });
            break;
          default:
            break;
        }
      }

      if (data.status === 203) {
        toast.warning(data.message);
        return
      }

      if (data.status === 404) {
        toast.error(data.message);
        return
      }

      dispatch(
        setAuth({
          user: data?.user,
          access_token: data?.access_token,
          refresh_token: data?.refresh_token
        })
      );
    },
    onError(error) {
      console.log(error)
      toast.error("An error occured while logging in.");
    }
  })

  // Animated background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; size: number; speedX: number; speedY: number }> = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      });
    }

    let animationFrameId: number;

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [features.length]);

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50 overflow-hidden">
      {/* Left - Login Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative h-screen overflow-y-auto">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-md">
          {/* Header with Back Button */}
          <div className="space-y-3 mb-10">
            {/* Back Button and Badge */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate({ to: '/' })}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group"
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>

              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {isAdmin ? 'Admin Access' : 'Alumni Portal'}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome Back
              </span>
              <br />
              <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                to Your Portal
              </span>
            </h1>

            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-emerald-500/50 rounded-full" />
              Sign in to continue managing your records
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-emerald-500/5 border border-emerald-100/50 p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Email / Matric */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                    {isAdmin ? "Email Address" : "Matric Number"}
                  </label>

                  <div className="relative group">
                    <input
                      {...register('email')}
                      type={isAdmin ? 'email' : 'text'}
                      placeholder={isAdmin ? 'admin@example.com' : 'MAT/2020/001'}
                      className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm
                               focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
                               transition-all duration-200 group-hover:border-emerald-300
                               placeholder:text-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {isAdmin ? (
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                {isAdmin && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                      Password
                    </label>

                    <div className="relative group">
                      <input
                        {...register('password')}
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm
                                 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
                                 transition-all duration-200 group-hover:border-emerald-300
                                 placeholder:text-gray-400"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>

                    {errors.password && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Button */}
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full relative overflow-hidden group rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 
                         py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25
                         hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02]
                         active:scale-[0.99] transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {mutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-linear-to-r from-emerald-700 to-teal-700 transition-transform duration-300" />
              </Button>

              {/* Decorative Footer */}
              <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                <span>Secure • Encrypted • Protected</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right - Visual Panel with Deep Green Accent */}
      <div className="hidden lg:flex items-center justify-center relative bg-linear-to-br from-emerald-800 via-emerald-900 to-teal-900 overflow-hidden h-screen">
        {/* Animated Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Abstract Shapes */}
        <div className="absolute inset-0">
          {/* Floating Circles */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

          {/* Geometric Patterns */}
          <div className="absolute top-40 right-40">
            <div className="relative">
              <div className="w-32 h-32 border-2 border-emerald-400/20 rotate-45 animate-spin-slow" />
              <div className="absolute inset-0 w-32 h-32 border-2 border-teal-400/20 -rotate-45 animate-spin-slow-reverse" />
            </div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size[50px_50px]" />

          {/* Diagonal Lines */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-1/4 top-0 w-full h-full bg-linear-to-r from-transparent via-emerald-500/5 to-transparent transform -skew-y-12" />
            <div className="absolute -right-1/4 top-0 w-full h-full bg-linear-to-l from-transparent via-teal-500/5 to-transparent transform skew-y-12" />
          </div>

          {/* Dots Pattern */}
          <div className="absolute bottom-20 left-20">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-emerald-400/20 rounded-full"
                  style={{
                    animation: `pulse ${2 + i * 0.2}s infinite`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content with Carousel */}
        <div className="relative z-10 text-center text-white px-12 max-w-lg w-full">


          <h2 className="text-4xl font-bold mb-4 bg-linear-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
            Electronic Records
          </h2>

          <p className="text-emerald-100/80 text-lg mb-12 leading-relaxed">
            Secure alumni access and document verification
          </p>

          {/* Feature Carousel */}
          <div className="relative mb-12">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Feature Slides */}
                {features.map((feature, index) => (
                  <div key={index} className="w-full shrink-0 px-4">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
                      {/* Feature Icon */}
                      <div className="w-16 h-16 mx-auto mb-6 bg-linear-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
                        {feature.icon}
                      </div>

                      {/* Feature Title */}
                      <h3 className="text-2xl font-semibold mb-3 text-white">
                        {feature.title}
                      </h3>

                      {/* Feature Description */}
                      <p className="text-emerald-100/80 text-sm leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Feature Tag */}
                      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-xs text-emerald-200 border border-white/10">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Available Now
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${currentSlide === index
                    ? 'w-8 h-2 bg-emerald-400'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Auto-play Progress Bar */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Active Users', value: '10K+' },
              { label: 'Documents', value: '50K+' },
              { label: 'Security', value: '99.9%' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-emerald-300">{stat.value}</div>
                <div className="text-xs text-emerald-100/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/20 to-transparent" />
      </div>
    </div>
  )
}