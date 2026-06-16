import React from 'react';

export const Table = React.memo(({ className = '', children, ...props }) => (
  <div className="relative w-full overflow-auto rounded-lg border border-border">
    <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
));
Table.displayName = 'Table';

export const TableHeader = React.memo(({ className = '', children, ...props }) => (
  <thead className={`bg-muted/50 border-b border-border ${className}`} {...props}>
    {children}
  </thead>
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.memo(({ className = '', children, ...props }) => (
  <tbody className={`divide-y divide-border ${className}`} {...props}>
    {children}
  </tbody>
));
TableBody.displayName = 'TableBody';

export const TableRow = React.memo(({ className = '', children, ...props }) => (
  <tr
    className={`hover:bg-muted/30 transition-colors duration-150 data-[state=selected]:bg-muted ${className}`}
    {...props}
  >
    {children}
  </tr>
));
TableRow.displayName = 'TableRow';

export const TableHead = React.memo(({ className = '', children, ...props }) => (
  <th
    className={`h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
));
TableHead.displayName = 'TableHead';

export const TableCell = React.memo(({ className = '', children, ...props }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
    {children}
  </td>
));
TableCell.displayName = 'TableCell';
