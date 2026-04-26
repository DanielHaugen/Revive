import React, { useCallback, useState } from 'react';
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
  onRowClick?: (rowData: T, e: React.MouseEvent) => void;
  className?: string;
  /** Initial sort direction for the first column. Defaults to 'ascending'. */
  defaultSortDirection?: 'ascending' | 'descending';
  /** Enable checkbox selection on each row. */
  selectable?: boolean;
  /** Set of currently selected row keys. */
  selectedKeys?: Set<string>;
  /** Called when selection changes. */
  onSelectionChange?: (keys: Set<string>) => void;
  /** Extract a unique string key from a row. Required when selectable is true. */
  getRowKey?: (row: T) => string;
};

function DataTable<T>({
  data,
  columns,
  onRowClick,
  className,
  defaultSortDirection = 'ascending',
  selectable,
  selectedKeys,
  onSelectionChange,
  getRowKey,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'ascending' | 'descending';
  }>({
    key: columns[0]?.accessor as keyof T,
    direction: defaultSortDirection,
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

  const allKeys = React.useMemo(
    () => (selectable && getRowKey ? sortedData.map(getRowKey) : []),
    [selectable, getRowKey, sortedData],
  );

  const allSelected = selectable && selectedKeys ? allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k)) : false;
  const someSelected = selectable && selectedKeys ? allKeys.some((k) => selectedKeys.has(k)) && !allSelected : false;

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(allKeys));
    }
  }, [allSelected, allKeys, onSelectionChange]);

  const handleSelectRow = useCallback(
    (key: string) => {
      if (!onSelectionChange || !selectedKeys) return;
      const next = new Set(selectedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      onSelectionChange(next);
    },
    [onSelectionChange, selectedKeys],
  );

  const colSpan = selectable ? columns.length + 1 : columns.length;

  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-lg overflow-hidden w-full ${className}`}
    >
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            {selectable && (
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={handleSelectAll}
                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                />
              </th>
            )}
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
              <td colSpan={colSpan} className="px-6 py-8 text-center text-gray-500">
                No data found.
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const rowKey = selectable && getRowKey ? getRowKey(row) : `row_${rowIndex}`;
              const isSelected = selectable && selectedKeys ? selectedKeys.has(rowKey) : false;

              return (
                <tr
                  key={rowKey}
                  className={twJoin([
                    'border-t border-gray-800 hover:bg-gray-800 transition-colors',
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-gray-800/60',
                  ])}
                  onClick={onRowClick ? (e) => onRowClick(row, e) : undefined}
                >
                  {selectable && (
                    <td className="px-3 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowKey)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}
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
              );
            })
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
