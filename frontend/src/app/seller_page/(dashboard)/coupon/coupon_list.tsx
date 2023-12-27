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
  id: 'couponname' | 'code' | 'type' | 'period' | 'discountrate' | 'discription';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'couponname', label: 'Coupon Name', minWidth: 170, align: 'right'},
  {
    id: 'code',
    label: 'Code',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'type',
    label: 'Type',
    minWidth: 170,
    align: 'right',
  },
  {
    id: 'period',
    label: 'Period',
    minWidth: 170,
    align: 'right',
  },
  {
    id: 'discountrate',
    label: 'Discountrate',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'discription',
    label: 'Discription',
    minWidth: 170,
    align: 'right',
  },
];

interface Data {
  couponname: string;
  code: number;
  type: string;
  period: string;
  discountrate: number;
  discription: string;
}

function createData(
  couponname: string,
  code: number,
  type: string,
  period: string,
  discountrate: number,
  discription: string,
): Data {
  return { couponname, code, type, period, discountrate, discription };
}

const rows = [
  createData('India', 100, 'All', '3287263', 0, 'Description 1'),
  createData('China', 1403500365, 'Ongoing', '9596961', 0, 'Description 2'),
  createData('Italy', 60483973, 'Upcoming', '301340', 0, 'Description 3'),
  createData('United States', 327167434, 'Expired', '9833520', 0, 'Description 4'),
  createData('Canada', 37602103, 'All', '9984670', 0, 'Description 5'),
  createData('Australia', 25475400, 'Ongoing', '7692024', 0, 'Description 6'),
  createData('Germany', 83019200, 'Upcoming', '357578', 0, 'Description 7'),
  createData('Ireland', 4857000, 'Expired', '70273', 0, 'Description 8'),
  createData('Mexico', 126577691, 'All', '1972550', 0, 'Description 9'),
  createData('Japan', 126317000, 'Ongoing', '377973', 0, 'Description 10'),
  createData('France', 67022000, 'Upcoming', '640679', 0, 'Description 11'),
  createData('United Kingdom', 67545757, 'Expired', '242495', 0, 'Description 12'),
  createData('Russia', 146793744, 'All', '17098246', 0, 'Description 13'),
  createData('Nigeria', 200962417, 'Ongoing', '923768', 0, 'Description 14'),
  createData('Brazil', 210147125, 'Upcoming', '8515767', 0, 'Description 15'),
];


export default function StickyHeadTable({inputType}: { inputType: string }) {
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
  if (inputType === 'All') {
    resultRows = rows;
  } else if (inputType === 'Ongoing'){
    resultRows = rows.filter(row => row.type === 'Ongoing');
  } else if (inputType === 'Upcoming'){
    resultRows = rows.filter(row => row.type === 'Upcoming');
  } else if (inputType === 'Expired'){
    resultRows = rows.filter(row => row.type === 'Expired');
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
