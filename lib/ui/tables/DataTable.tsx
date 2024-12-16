import React, { useEffect, useState } from 'react';

export type Column<T> = {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode); // Allow function-based accessors
  render?: (
    value: T[keyof T] | React.ReactNode,
    row: T
  ) => React.ReactNode | Promise<React.ReactNode>; // Optionally pass the whole item to render
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
      className={`bg-white shadow-lg rounded-lg overflow-hidden w-full ${className}`}
    >
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={`col_${idx}`}
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort(column.accessor as keyof T)}
              >
                <div className="flex items-center justify-between">
                  {column.header}
                  {sortConfig.key === column.accessor && (
                    <span className="ml-2 text-gray-600">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={`row_${rowIndex}`}
              className="border-t hover:bg-gray-50 cursor-pointer" // Indicate clickability
              onClick={(e) => onRowClick && onRowClick(row, e)} // Handle row click
            >
              {columns.map((column) => {
                const cellValue =
                  typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : row[column.accessor];

                const renderValue = column.render
                  ? column.render(cellValue, row)
                  : renderDefault(cellValue);

                // If the render value is a promise, resolve it
                if (renderValue instanceof Promise) {
                  const [resolvedValue, setResolvedValue] =
                    useState<React.ReactNode | null>(null);

                  useEffect(() => {
                    renderValue.then((resolved) => setResolvedValue(resolved));
                  }, [renderValue]);

                  return (
                    <td key={String(column.header)} className="px-4 py-2">
                      {resolvedValue}
                    </td>
                  );
                }

                return (
                  <td key={String(column.header)} className="px-4 py-2">
                    {renderValue}
                  </td>
                );
              })}
            </tr>
          ))}
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
