import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  hidden?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "Aucune donnée disponible",
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Chargement en cours...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns
              .filter((column) => !column.hidden)
              .map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-muted/50 focus-within:bg-muted/50 transition-colors"
              )}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "link" : undefined}
              onClick={() => onRowClick && onRowClick(item)}
              onKeyDown={
                onRowClick
                  ? (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }
                  : undefined
              }
            >
              {columns
                .filter((column) => !column.hidden)
                .map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {typeof column.accessorKey === "function"
                      ? column.accessorKey(item)
                      : (item[column.accessorKey] as React.ReactNode)}
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Composant pour les badges de statut
export function StatusBadge({
  status,
  variant = "default",
}: {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}) {
  return (
    <Badge variant={variant} className="w-fit">
      {status}
    </Badge>
  );
} 