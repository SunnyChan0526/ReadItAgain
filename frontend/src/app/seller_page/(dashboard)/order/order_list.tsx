"use client";
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

interface Column {
  id: 'book' | 'order_total' | 'status' | 'all_channels';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'book', label: 'Book(s)', minWidth: 170, align: 'right'},
  {
    id: 'order_total',
    label: 'Order Total',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 170,
    align: 'right',
  },
  {
    id: 'all_channels',
    label: 'All Channels',
    minWidth: 170,
    align: 'right',
  },
];

interface Data {
  book: string;
  order_total: number;
  status: string;
  all_channels: string;
}

function createData(
  book: string,
  order_total: number,
  status: string,
  all_channels: string,
): Data {
  return { book, order_total, status, all_channels };
}

const rows = [
  createData('India', 100, 'To ship', 'IE'),
  createData('China', 1403500365, 'Shipping', 'CN'),
  createData('Italy', 60483973, 'Completed', 'IT'),
  createData('United States', 327167434, 'Cancellation', 'US'),
  createData('Canada', 37602103, 'To ship', 'CA'),
  createData('Australia', 25475400, 'Shipping', 'AU'),
  createData('Germany', 83019200, 'Completed', 'DE'),
  createData('Ireland', 4857000, 'Cancellation', 'IE'),
  createData('Mexico', 126577691, 'To ship', 'MX'),
  createData('Japan', 126317000, 'Shipping', 'JP'),
  createData('France', 67022000, 'Completed', 'FR'),
  createData('United Kingdom', 67545757, 'Cancellation', 'GB'),
  createData('Russia', 146793744, 'To ship', 'RU'),
  createData('Nigeria', 200962417, 'Shipping', 'NG'),
  createData('Brazil', 210147125, 'Completed', 'BR'),
];


export default function StickyHeadTable({inputStatus}: { inputStatus: string }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  
  let resultRows = rows;
  if (inputStatus === 'All') {
    resultRows = rows;
  } else if (inputStatus === 'To ship'){
    resultRows = rows.filter(row => row.status === 'To ship');
  } else if (inputStatus === 'Shipping'){
    resultRows = rows.filter(row => row.status === 'Shipping');
  } else if (inputStatus === 'Completed'){
    resultRows = rows.filter(row => row.status === 'Completed');
  } else if (inputStatus === 'Cancellation'){
    resultRows = rows.filter(row => row.status === 'Cancellation');
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {resultRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1}>
                  {/* <TableRow hover role="checkbox" tabIndex={-1} key={row.book}> */}
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow> 
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}