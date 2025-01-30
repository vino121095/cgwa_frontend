import { useMemo, useEffect, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import Slideover from '@/components/Base/Headless/Slideover';

interface Device {
  id: number;
  device_uid: string;
  device_name: string;
  latitude: string;
  longitude: string;
  device_type: string;
  flow: number;
  totaliser: number;
  level: number;
  created_at: string;
  updated_at: string;
}

function DeviceList() {
  const { site_uid } = useParams<{ site_uid: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        if (!site_uid) throw new Error('Site UID is missing'); // Change here

        const response = await fetch(`http://127.0.0.1:8000/api/site/${site_uid}/devices`); // Change here
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.status_code === 200) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch devices');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices();
  }, [site_uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      if (!selectedDevice) return;

      // Create FormData object
      const formData = new FormData();
      formData.append('device_uid', selectedDevice.device_uid);
      formData.append('device_name', selectedDevice.device_name);
      formData.append('device_uid', selectedDevice.device_uid);
      formData.append('latitude', selectedDevice.latitude);
      formData.append('longitude', selectedDevice.longitude);
      formData.append('device_type', selectedDevice.device_type);
      formData.append('flow', selectedDevice.flow.toString());
      formData.append('totaliser', selectedDevice.totaliser.toString());
      formData.append('level', selectedDevice.level.toString());

      const response = await fetch(
        `http://127.0.0.1:8000/api/device/update/${selectedDevice.id}`,
        {
          method: 'PUT',
          body: formData,
          // Headers are NOT set here - browser will automatically set
          // the correct 'multipart/form-data' content type with boundary
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        // Handle different error formats
        const errors = responseData.detail ||
          responseData.errors ||
          (Array.isArray(responseData) ? responseData : [responseData]);

        const errorMessages = errors.map((error: any) =>
          error.msg ? `${error.loc[1]} ${error.msg}` : JSON.stringify(error)
        );

        throw new Error(errorMessages.join(', '));
      }

      // Update local data
      setData(prevData =>
        prevData.map(device =>
          device.id === selectedDevice.id ? selectedDevice : device
        )
      );

      setIsEditModalOpen(false);
      alert('Device updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      setValidationErrors(
        error instanceof Error ?
          error.message.split(', ') :
          ['Failed to update device']
      );
      alert('Failed to update device. Please check the form values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedDevice(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: name === 'flow' || name === 'totaliser' || name === 'level'
          ? parseFloat(value)
          : value
      };
    });
  };

  const columns = useMemo<MRT_ColumnDef<Device>[]>(() => [
    {
      id: "sno",
      header: "#",
      size: 50,
      Cell: ({ row }) => row.index + 1
    },
    {
      accessorKey: 'device_uid',
      header: 'Device UID',
    },
    {
      accessorKey: 'device_name',
      header: 'Device Name',
    },
    {
      accessorKey: 'device_type',
      header: 'Device Type',
    },
    {
      accessorKey: 'latitude',
      header: 'Latitude',
    },
    {
      accessorKey: 'longitude',
      header: 'Longitude',
    },
    // {
    //   accessorKey: 'flow',
    //   header: 'Flow',
    //   Cell: ({ cell }) => cell.getValue<number>().toFixed(2),
    // },
    // {
    //   accessorKey: 'totaliser',
    //   header: 'Totaliser',
    //   Cell: ({ cell }) => cell.getValue<number>().toFixed(2),
    // },
    // {
    //   accessorKey: 'level',
    //   header: 'Level',
    //   Cell: ({ cell }) => cell.getValue<number>().toFixed(2),
    // },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated At',
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 100,
      Cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="pending"
            size="sm"
            onClick={() => {
              setSelectedDevice(row.original);
              setIsEditModalOpen(true);
            }}
          >
            <Lucide icon="Pencil" className="w-5 h-5" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this device?')) {
                try {
                  const response = await fetch(
                    `http://127.0.0.1:8000/api/device/delete/${row.original.id}`,
                    {
                      method: 'DELETE',
                    }
                  );

                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }

                  // Refresh data or update state after successful deletion
                  setData(prevData => prevData.filter(device => device.id !== row.original.id));

                  // Optional: Show success message
                  alert('Device deleted successfully');

                } catch (error) {
                  console.error('Delete error:', error);
                  alert('Failed to delete device');
                }
              }
            }}
          >
            <Lucide icon="Trash" className="w-5 h-5" />
          </Button>
        </div>
      ),
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data,
    state: {
      isLoading,
      showAlertBanner: !!error,
    },
    enableDensityToggle: true,
    initialState: {
      columnPinning: { right: ['actions'] },
      density: 'compact'
    },
    muiTablePaperProps: {
      elevation: 0,
      style: {
        boxShadow: 'none',
        borderRadius: '15px'
      }
    }
  });

  if (isLoading) return <div className="p-4">Loading devices...</div>;
  if (error) return <div className="p-4">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-col items-center mt-8 intro-y sm:flex-row">
        <h2 className="mr-auto text-lg font-medium">Devices List - Site {site_uid}</h2>
        <div className="flex w-full mt-4 mb-5 sm:w-auto sm:mt-0">
          <Button
            variant="primary"
            className="mr-2 shadow-md"
            onClick={() => navigate('/sites')}
          >
            <Lucide icon="ArrowLeft" className="w-4 h-4 mr-2" />
            Back to Sites
          </Button>
        </div>
      </div>
      <MaterialReactTable table={table} />

      <Slideover
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <Slideover.Panel className="w-[90%] sm:w-[600px]">
          <Slideover.Title className="border-b p-4">
            <h2 className="text-lg font-semibold">Edit Device</h2>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4"
            >
              <Lucide icon="X" className="w-6 h-6 text-gray-500" />
            </button>
          </Slideover.Title>

          <Slideover.Description className="p-4 space-y-4">
            {validationErrors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <ul className="list-disc pl-5">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDevice && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Device Name
                    </label>
                    <input
                      type="text"
                      name="device_name"
                      value={selectedDevice.device_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="device_uid" className="block text-sm font-medium text-gray-700 mb-1">
                      Device UID
                    </label>
                    <input
                      type="text"
                      id="device_uid"
                      name="device_uid"
                      value={selectedDevice.device_uid || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                      disabled  // Changed from disabled to readOnly
                      aria-describedby="device_uid_help"
                    />
                    <p id="device_uid_help" className="mt-1 text-sm text-gray-500">
                      Unique device identifier (cannot be changed)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Latitude
                      </label>
                      <input
                        type="text"
                        name="latitude"
                        value={selectedDevice.latitude}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Longitude
                      </label>
                      <input
                        type="text"
                        name="longitude"
                        value={selectedDevice.longitude}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Device Type
                    </label>
                    <input
                      type="text"
                      id="device_uid"
                      name="device_uid"
                      value={selectedDevice.device_type || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                      disabled  // Changed from disabled to readOnly
                      aria-describedby="device_uid_help"
                    />
                  </div>

                  {/* <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Flow
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="flow"
                        value={selectedDevice.flow}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Totaliser
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="totaliser"
                        value={selectedDevice.totaliser}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Level
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="level"
                        value={selectedDevice.level}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div> */}

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Slideover.Description>
        </Slideover.Panel>
      </Slideover>
    </div>
  );
}

export default DeviceList;