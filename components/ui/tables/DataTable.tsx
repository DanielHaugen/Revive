import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // If using Next.js

type DataTableProps<T> = {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T;
    render?: (value: T[keyof T]) => React.ReactNode;
  }[];
  onRowClick?: (rowData: T) => void; // New prop for row click handling
};

function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'ascending' | 'descending';
  }>({
    key: columns[0]?.accessor,
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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessor)}
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort(column.accessor)}
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
              key={rowIndex}
              className="border-t hover:bg-gray-50 cursor-pointer" // Indicate clickability
              onClick={() => onRowClick && onRowClick(row)} // Handle row click
            >
              {columns.map((column) => {
                const cellValue = row[column.accessor];
                return (
                  <td key={String(column.accessor)} className="px-4 py-2">
                    {column.render
                      ? column.render(cellValue)
                      : renderDefault(cellValue)}
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
