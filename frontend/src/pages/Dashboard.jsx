import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import mockProjects from '../mock/projects.json';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Dashboard() {
  const [rowData] = useState(mockProjects);
  const [colDefs] = useState([
    { field: 'id', headerName: 'ID', filter: true, sortable: true, width: 80 },
    { field: 'title', headerName: 'Project Title', filter: true, sortable: true, flex: 1 },
    { field: 'client', headerName: 'Client', filter: true, sortable: true },
    { field: 'freelancer', headerName: 'Freelancer', filter: true, sortable: true },
    { field: 'budget', headerName: 'Budget ($)', filter: true, sortable: true },
    { field: 'status', headerName: 'Status', filter: true, sortable: true },
    { field: 'deadline', headerName: 'Deadline', filter: true, sortable: true },
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Overview</h1>
          <p className="text-gray-500 mt-1">Live tracking of ongoing agreements and milestones</p>
        </div>
      </div>
      <div style={{ height: 360, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={5}
        />
      </div>
    </div>
  );
}

