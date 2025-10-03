import React from 'react';
import NewWarrantyForm from './NewWarrantyForm';

function SalespersonDashboard() {
  return (
    <div>
      <h2>Salesperson Dashboard</h2>
      <p>Welcome, Salesperson. Here you can create new warranty claims and view your sales performance.</p>
      
      <NewWarrantyForm />

      {/* Salesperson-specific components and functionality will go here */}
    </div>
  );
}

export default SalespersonDashboard;
