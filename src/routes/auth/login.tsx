
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
      console.log(data)
      if (data.status === 200) {
        toast.success(`Logged in as ${data.user.email}`)
      }

      if (data.status === 203) {
        toast.warning(data.message);
      }

      dispatch(
        setAuth({
          user: data?.user,
          access_token: data?.access_token,
          refresh_token: data?.refresh_token
        })
      );

      navigate({
        to: data.user?.role?.name === "ALUMNI" ? "/user" : "/admin",
      });
    },
    onError(error) {
      console.log(error)
      toast.error("An error occured while logging in.");
    }
  })

  return (
    <div className='h-screen flex flex-col relative p-6 md:p-0'>

      <div className="max-w-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6">
        <div>
          <h1 className="text-blue-800 text-4xl text-center font-bold mb-8">
            Login
          </h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {isAdmin ? "Email" : "Matric Number"}
            </label>
            {isAdmin ? (
              <input
                {...register('email')}
                type="email"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                {...register('email')}
                type="text"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password (Admin Only) */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-blue-700 py-2 text-white font-semibold hover:bg-blue-800 disabled:opacity-50"
          >
            {mutation.isPending ? (<Spinner />) : 'Login'}
          </button>
        </form>
      </div >

      <Triangle className="hidden md:block absolute left-0 h-screen fill-green-800" />
      <Triangle className="hidden md:block absolute h-screen fill-blue-800 scale-y-[-1]" />
    </div >
  )
}
