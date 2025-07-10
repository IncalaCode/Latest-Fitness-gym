import React from 'react';
import useMembers from '../../../hooks/useMembers';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TableSortLabel,
  Typography
} from '@mui/material';

export default function MembersTable({ filters, rowsPerPage, currentPage, onPageChange, onSort }) {
  // Only fetch members when filters, page, or sort change
  const {
    members,
    loading,
    error,
    totalPages,
    handleSort,
    handlePageChange
  } = useMembers(rowsPerPage, filters, currentPage);

  // Table rendering logic (simplified for brevity)
  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Membership</TableCell>
            <TableCell>Status</TableCell>
            {/* Add more columns as needed */}
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map(member => (
            <TableRow key={member.id}>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.membership}</TableCell>
              <TableCell>{member.membershipStatus}</TableCell>
              {/* Add more cells as needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Pagination and sorting controls can go here, using onPageChange and onSort */}
    </TableContainer>
  );
} 