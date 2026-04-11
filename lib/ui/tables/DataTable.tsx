import React, { useState } from 'react';
import { twJoin } from 'tailwind-merge';

export type Column<T> = {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  render?: (
    value: T[keyof T] | React.ReactNode,
    row: T
  ) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (rowData: T, e: React.MouseEvent) => void; // New prop for row click handling
  className?: string;
};

function DataTable<T>({
  data,
  columns,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'ascending' | 'descending';
  }>({
    key: columns[0]?.accessor as keyof T,
    direction: 'ascending',
  });

  const sortedData = React.useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const handleSort = (column: keyof T) => {
    setSortConfig((prevState) => ({
      key: column,
      direction:
        prevState.key === column && prevState.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  };

  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-lg overflow-hidden w-full ${className}`}
    >
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={`col_${idx}`}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleSort(column.accessor as keyof T)}
              >
                <div className="flex items-center justify-between gap-2">
                  {column.header}
                  {sortConfig.key === column.accessor && (
                    <span className="text-gray-500 text-xs">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                No data found.
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={`row_${rowIndex}`}
                className={twJoin([
                  'border-t border-gray-800 hover:bg-gray-800 transition-colors',
                  onRowClick && 'cursor-pointer',
                ])}
                onClick={onRowClick ? (e) => onRowClick(row, e) : undefined}
              >
                {columns.map((column) => {
                  const cellValue =
                    typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : row[column.accessor];

                  const renderValue = column.render
                    ? column.render(cellValue, row)
                    : renderDefault(cellValue);

                  return (
                    <td key={String(column.header)} className="px-6 py-3 text-sm text-gray-300">
                      {renderValue}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to safely render default values
function renderDefault(value: unknown): React.ReactNode {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return null;
}

export default DataTable;
