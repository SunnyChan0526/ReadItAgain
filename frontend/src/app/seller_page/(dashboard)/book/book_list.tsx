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
  id: 'book' | 'description' | 'price' | 'status';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'book', label: 'Book(s)', minWidth: 170, align: 'right'},
  {
    id: 'description',
    label: 'Description',
    minWidth: 170,
    align: 'right',
  },
  {
    id: 'price',
    label: 'Price',
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
];

interface Data {
  book: string;
  description: string;
  price: number;
  status: string;
}

function createData(
  book: string,
  description: string,
  price: number,
  status: string,
): Data {
  return { book, description, price, status };
}

const rows = [
  createData('India', 'IN', 1324171354, 'All'),
  createData('China', 'CN', 1403500365, 'Ordered'),
  createData('Italy', 'IT', 60483973, 'On sale'),
  createData('United States', 'US', 327167434, 'Sold'),
  createData('Canada', 'CA', 37602103, 'No picture'),
  createData('Australia', 'AU', 25475400, 'All'),
  createData('Germany', 'DE', 83019200, 'Ordered'),
  createData('Ireland', 'IE', 4857000, 'On sale'),
  createData('Mexico', 'MX', 126577691, 'Sold'),
  createData('Japan', 'JP', 126317000, 'No picture'),
  createData('France', 'FR', 67022000, 'All'),
  createData('United Kingdom', 'GB', 67545757, 'Ordered'),
  createData('Russia', 'RU', 146793744, 'On sale'),
  createData('Nigeria', 'NG', 200962417, 'Sold'),
  createData('Brazil', 'BR', 210147125, 'No picture'),
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
  } else if (inputStatus === 'On sale'){
    resultRows = rows.filter(row => row.status === 'On sale');
  } else if (inputStatus === 'Sold'){
    resultRows = rows.filter(row => row.status === 'Sold');
  } else if (inputStatus === 'Ordered'){
    resultRows = rows.filter(row => row.status === 'Ordered');
  } else if (inputStatus === 'No picture'){
    resultRows = rows.filter(row => row.status === 'No picture');
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
                  {/* <TableRow hover role="checkbox" tabIndex={-1} key={row.code}> */}
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
