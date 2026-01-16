import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnMeta {
    className?: string;
    colSpan?: number;
}

interface UserRequestRowProps {
    row: {
        type: string;
        id: string;
        document_type: string;
        createdAt?: string | Date;
        status?: string;
        payment_status?: string;
        amount?: number;
    };
    columns: ColumnDef<any>[];
    totalColumns: number;
    onView: (id: string) => void;
}

const statusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
        case "APPROVED":
            return "text-green-600 bg-green-50";
        case "REJECTED":
            return "text-red-600 bg-red-50";
        default:
            return "text-yellow-600 bg-yellow-50";
    }
};

export default function UserRequestRow({
    row,
    columns,
    totalColumns,
    onView,
}: UserRequestRowProps) {
    return (
        <div
            className="grid border-b border-gray-200 hover:bg-gray-50 items-center transition-colors duration-150"
            style={{
                gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
            }}
        >
            {/* Document */}
            <div
                className={`p-3 font-medium ${(columns[0].meta as ColumnMeta)?.className || ""}`}
                style={{
                    gridColumn: `span ${(columns[0].meta as ColumnMeta)?.colSpan || 1}`,
                }}
            >
                {row.document_type || "—"}
            </div>

            {/*Type */}
            <div
                className={`p-3 font-medium ${(columns[1].meta as ColumnMeta)?.className || ""}`}
                style={{
                    gridColumn: `span ${(columns[1].meta as ColumnMeta)?.colSpan || 1}`,
                }}
            >
                {row.type || "—"}
            </div>

            {/* Status */}
            <div
                className={`p-3 text-center ${(columns[2].meta as ColumnMeta)?.className || ""}`}
                style={{
                    gridColumn: `span ${(columns[2].meta as ColumnMeta)?.colSpan || 1}`,
                }}
            >
                <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(row.status)}`}
                >
                    {row.status || "PENDING"}
                </span>
            </div>

            {/* Payment Status */}
            <div
                className={`p-3 text-center ${(columns[3].meta as ColumnMeta)?.className || ""}`}
                style={{
                    gridColumn: `span ${(columns[3].meta as ColumnMeta)?.colSpan || 1}`,
                }}
            >
                {row.payment_status || "—"}
            </div>

            {/* Amount */}
            <div
                className={`p-3 text-right font-semibold ${(columns[4].meta as ColumnMeta)?.className || ""}`}
                style={{
                    gridColumn: `span ${(columns[4].meta as ColumnMeta)?.colSpan || 1}`,
                }}
            >
                {row.amount !== undefined ? `₦${row.amount.toLocaleString()}` : "—"}
            </div>

            {/* Request Date */}
            <div
                className={`p-3 text-gray-700 ${(columns[5].meta as ColumnMeta)?.className || ""}`}
                style={{
                    gridColumn: `span ${(columns[5].meta as ColumnMeta)?.colSpan || 1}`,
                }}
            >
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-GB") : "—"}
            </div>

            {/* Actions */}
            <div
                className={`p-3 flex justify-center ${(columns[6].meta as ColumnMeta)?.className || ""}`}
                style={{
                    gridColumn: `span ${(columns[6].meta as ColumnMeta)?.colSpan || 1}`,
                }}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-32">
                        <DropdownMenuItem
                            onClick={() => onView(row.id)}
                            className="flex items-center gap-2"
                        >
                            <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
