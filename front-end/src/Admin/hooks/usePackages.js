import { useState, useEffect } from 'react';
import { API_URL } from '../../config/config';
import { GET_HEADER } from '../../config/config';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function arrayToCSV(data, fields) {
  const csvRows = [];
  // Header
  csvRows.push(fields.join(','));
  // Rows
  for (const row of data) {
    const values = fields.map(field => {
      let value = row[field];
      if (Array.isArray(value)) value = value.join('; ');
      if (value === undefined || value === null) value = '';
      // Escape quotes
      value = String(value).replace(/"/g, '""');
      return `"${value}"`;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function usePackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const options = await GET_HEADER();
      const response = await fetch(`${API_URL}/packages`, {
        headers: options.headers
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch packages');
      setPackages(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const exportPackages = (data, fields, format = 'csv') => {
    if (format === 'csv') {
      const csv = arrayToCSV(data, fields);
      downloadCSV(csv, 'packages_export.csv');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      const tableData = data.map(row =>
        fields.map(field => Array.isArray(row[field]) ? row[field].join('; ') : row[field] ?? '')
      );
      doc.autoTable({
        head: [fields],
        body: tableData,
      });
      doc.save('packages_export.pdf');
    } else {
      alert('Only CSV and PDF export are supported in the browser.');
    }
  };

  return {
    packages,
    loading,
    error,
    exportPackages,
    refresh: fetchPackages
  };
}