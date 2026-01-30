
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import Triangle from '@/components/background/Triangle';
import { useMutation } from '@tanstack/react-query';
import { LoginAlumni, LoginUser } from '@/service';
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/auth.slice';
import { Button } from '@/components/ui/button';

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

        navigate({
          to: data.user?.role?.name === "ALUMNI" ? "/user" : "/admin",
        });
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

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Holla,
              <br />
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to continue managing your records
            </p>
          </div>

          {/* Form*/}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className='grid space-y-1'>
              {/* Email / Matric */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {isAdmin ? "Email" : "Matric Number"}
                </label>

                <input
                  {...register('email')}
                  type={isAdmin ? 'email' : 'text'}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                         focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20
                         transition"
                />

                {errors.email && (
                  <p className="text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              {isAdmin && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <input
                    {...register('password')}
                    type="password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                           focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20
                           transition"
                  />

                  {errors.password && (
                    <p className="text-xs text-red-600">
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
              className="rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white
                       hover:bg-blue-800 active:scale-[0.99]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition"
            >
              {mutation.isPending ? <span className='flex gap-2 items-center justify-center'> <Spinner /> Loading...</span> : 'Login'}
            </Button>
          </form>


        </div>
      </div>

      {/* Right (Visual Panel) */}
      <div className="hidden lg:flex items-center justify-center relative bg-gradient-to-br from-blue-700 to-blue-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative text-center text-white px-12">
          <h2 className="text-3xl font-semibold">Electronic Records</h2>
          <p className="mt-2 text-sm text-blue-100">
            Secure alumni access and document verification
          </p>
        </div>
      </div>
    </div>
  )
}
