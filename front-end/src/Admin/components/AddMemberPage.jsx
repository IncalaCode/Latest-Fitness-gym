import React from 'react';
import AdminLayout from './AdminLayout';
import AddMemberForm from './forms/AddMemberForm';

const AddMemberPage = () => {
  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Member</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <AddMemberForm />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddMemberPage;