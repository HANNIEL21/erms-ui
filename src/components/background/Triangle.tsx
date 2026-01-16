import { cn } from "@/lib/utils";

export default function Triangle({
	className = "",
	...props
}: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 40 100"
			className={cn("fill-current", className)}
			{...props}
		>
			<title>Triangle</title>
			<polygon points="0,100 0,0 40,100" />
		</svg>
	);
}
