import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import Slideover from '@/components/Base/Headless/Slideover';
import { FormInput, FormLabel, FormTextarea } from '@/components/Base/Form';
import TomSelect from '@/components/Base/TomSelect';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

interface SiteData {
  id: number;
  username: string;
  hashed_password: string;
  email: string;
  phone: string;
  logo: string;
  created_at: string;
  updated_at: string;
  city: string;
  address: string;
  state: string;
  aggregator_id: number | null;
  industry_id: number | null;
  auth_key: string;
  site_name: string;
  documents?: string[];
}

interface DeviceFormData {
  site_id: string;
  device_uid: string;
  device_name: string;
  device_type: string;
  chip_id: string;
  longitude: string;
  latitude: string;
}

function Index() {
  const navigate = useNavigate();
  const [sitesData, setSitesData] = useState<SiteData[]>([]);
  const [headerFooterSlideoverPreview, setHeaderFooterSlideoverPreview] = useState(false);
  const [role, setRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [viewSlideoverPreview, setViewSlideoverPreview] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewLoadingId, setViewLoadingId] = useState<number | null>(null);
  const [devicesheaderFooterSlideoverPreview, setDevicesHeaderFooterSlideoverPreview] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [sites, setSites] = useState([]);
  const [aggregators, setAggregators] = useState([]);

  useEffect(() => {
    const fetchAggregators = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/aggregator/all');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Check if data is an array
        if (Array.isArray(data)) {
          setAggregators(data);
        } else {
          console.error('Expected an array but got:', data);
          setAggregators([]); // Set to empty array if not an array
        }
      } catch (error) {
        console.error('Error fetching aggregators:', error);
        setAggregators([]); // Set to empty array on error
      }
    };

    fetchAggregators();
  }, []);

  const [authKey, setAuthKey] = useState('');

  const generateAuthKey = () => {
    // Logic to generate a new auth key
    const newKey = 'generated-key-' + Math.random().toString(36).substr(2, 9); // Example key generation
    setAuthKey(newKey);
  };

  const resetAuthKey = () => {
    setAuthKey('');
  };
  // const handleClick = (siteId: number) => {
  //   setSelectedSiteId(siteId);
  //   setDevicesHeaderFooterSlideoverPreview(true);
  // };

  const [formData, setFormData] = useState({
    username: "",
    sitename: "",
    hashed_password: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    state: "",
    aggregator_id: "",
    industry_id: "",
    auth_key: '',
  });

  const [formDataEdit, setFormDataEdit] = useState({
    username: '',
    email: '',
    site_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    logo: null as File | null,
    documents: [] as File[],
    aggregator_id: '',
    industry_id: '',
    auth_key: '',
    auth_expiry: ''
  });

  const [deviceFormData, setDeviceFormData] = useState<DeviceFormData>({
    site_id: '',
    device_uid: '',
    device_name: '',
    device_type: '',
    chip_id: '',
    longitude: '',
    latitude: ''
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  const fetchSitesData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/site/all');
      const responseJson = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  };

  const handleEditChange = (e) => {
    setFormDataEdit({
      ...formDataEdit,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (name, files) => {
    if (name === 'documents') {
      setFormDataEdit(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)]
      }));
    } else {
      setFormDataEdit({
        ...formDataEdit,
        [name]: files[0]
      });
    }
  };

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await fetchSitesData();
        setSitesData(data);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
    const roles = Cookies.get('roles');
    if (roles) setRole(roles);
    Cookies.remove('viewsite');
  }, []);

  const handleDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate site selection
    if (!selectedSiteId) {
      alert('Please select a valid site');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('site_id', deviceFormData.site_id);
      formData.append('device_uid', deviceFormData.device_uid);
      formData.append('device_name', deviceFormData.device_name);
      formData.append('device_type', deviceFormData.device_type);
      formData.append('chip_id', deviceFormData.chip_id);
      formData.append('longitude', deviceFormData.longitude);
      formData.append('latitude', deviceFormData.latitude);

      const response = await fetch(
        `http://127.0.0.1:8000/api/device/create/${selectedSiteId}`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.detail) {
          const messages = errorData.detail.map?.((err: any) =>
            `${err.loc?.join('.')} ${err.msg}`
          ) || [errorData.detail];
          throw new Error(messages.join('\n'));
        }
        throw new Error(errorData.message || 'Creation failed');
      }
      alert('Device created successfully!');
      // Reset form
      setDeviceFormData({
        site_id: '',
        device_uid: '',
        device_name: '',
        device_type: '',
        chip_id: '',
        longitude: '',
        latitude: ''
      });
      setDevicesHeaderFooterSlideoverPreview(false);

      // Refresh data
      const refreshData = await fetchSitesData();
      setSitesData(refreshData);

    } catch (error) {
      console.error('Full error:', error);
      alert(error.message || 'Device creation failed. Check console.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSite) return;

    const formDataEditObj = new FormData();

    // Convert data types and handle empty values
    const processedData = {
      ...formDataEdit,
      aggregator_id: formDataEdit.aggregator_id || null,
      industry_id: formDataEdit.industry_id || null,
      auth_expiry: formDataEdit.auth_expiry ? new Date(formDataEdit.auth_expiry).toISOString() : null
    };

    // Append all fields with proper data types
    Object.entries(processedData).forEach(([key, value]) => {
      if (key === 'logo') {
        if (value instanceof File) {
          formDataEditObj.append('logo', value);
        } else if (typeof value === 'string') {
          formDataEditObj.append('logo_path', value);
        }
      }
      else if (key === 'documents') {
        if (Array.isArray(value)) {
          value.forEach(doc => {
            if (doc instanceof File) {
              formDataEditObj.append('documents', doc);
            } else {
              formDataEditObj.append('document_paths[]', doc);
            }
          });
        }
      }
      else if (key === 'aggregator_id' || key === 'industry_id') {
        formDataEditObj.append(key, value ? Number(value) : -1);
      }
      else if (value !== null && value !== undefined) {
        formDataEditObj.append(key, value);
      }
    });

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/site/update/${selectedSite.id}`, {
        method: 'PUT',
        body: formDataEditObj,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          console.error('Validation errors:', errorData);
        } catch {
          console.error('Server error:', errorText);
        }
        return;
      }
      alert('Site updated successfully!');
      // Refresh data after successful update
      const updatedResponse = await fetch('http://127.0.0.1:8000/api/site/all');
      const updatedData = await updatedResponse.json();
      setSites(updatedData.data);
      setSelectedSite(null);
    } catch (error) {
      console.error('Error updating site:', error);
    }
  };


  const handleEditClick = async (site: SiteData) => {
    setSelectedSite(site);
    setFormDataEdit({
      username: site.username,
      email: site.email,
      site_name: site.site_name,
      phone: site.phone,
      address: site.address,
      city: site.city,
      state: site.state,
      logo: site.logo,
      documents: JSON.parse(site.documents),
      aggregator_id: site.aggregator_id?.toString() || '',
      industry_id: site.industry_id?.toString() || '',
      auth_key: site.auth_key,
      auth_expiry: site.auth_expiry ? site.auth_expiry.split('+')[0] : ''
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors([]);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (['aggregator_id', 'industry_id'].includes(key)) {
        form.append(key, value ? String(value) : '');
      } else {
        form.append(key, value);
      }
    });

    if (logo) form.append('logo', logo, logo.name);
    documents.forEach(doc => form.append('documents', doc, doc.name));

    try {
      const response = await fetch('http://127.0.0.1:8000/api/site/register', {
        method: 'POST',
        body: form,
        headers: {
          'Accept': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert('Site registered successfully!');
        setFormData({
          username: "",
          sitename: "",
          hashed_password: "",
          email: "",
          phone: "",
          city: "",
          address: "",
          state: "",
          aggregator_id: "",
          industry_id: "",
          auth_key: '',
        });
        setLogo(null);
        setDocuments([]);
        setHeaderFooterSlideoverPreview(false);
        const refreshData = await fetchSitesData();
        setSitesData(refreshData);
      } else {
        if (result.detail) {
          const errors = Array.isArray(result.detail) ? result.detail.map((err: any) => `${err.loc[1]}: ${err.msg}`) : [result.detail];
          setValidationErrors(errors);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setValidationErrors(['Network error - please try again later']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      if (files.length + documents.length > 4) {
        alert('Maximum 4 documents allowed');
        return;
      }
      setDocuments(prev => [...prev, ...files]);
    }
  };

  const handleFileDelete = (fileName: string) => {
    setDocuments(prev => prev.filter(file => file.name !== fileName));
  };

  const deleteSite = async (site: SiteData) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/site/delete/${site.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the sites list after deletion
        const refreshResponse = await fetch('http://127.0.0.1:8000/api/site/all');
        const { data } = await refreshResponse.json();
        setSitesData(data);
        alert('Site deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to delete site');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting site');
    }
  };

  const handleViewSite = async (site: SiteData) => {
    setSelectedSite(site);
    setViewSlideoverPreview(true);
    setViewLoadingId(site.id);
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/site/${site.id}`);
      if (!response.ok) throw new Error('Failed to fetch site details');
      const data = await response.json();
      setSelectedSite(data.data);
    } catch (error) {
      console.error('Error fetching site details:', error);
      alert('Error loading site details');
    } finally {
      setIsLoading(false);
      setViewLoadingId(null);
    }
  };
  console.log(selectedSite);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/(\d+)\/(\d+)\/(\d+),/, '$1-$2-$3');
  };

  const columns = useMemo<MRT_ColumnDef<SiteData>[]>(
    () => [
      {
        id: "sno",
        header: "#",
        size: 50,
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "site_name",
        header: "Site Name",
        size: 100,
      },
      {
        accessorKey: "username",
        header: "Username",
        size: 100,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 100,
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
        size: 100,
      },
      {
        accessorKey: "logo",
        header: "Logo",
        size: 50,
        Cell: ({ row }) => (
          <div className="table">
            <>
              {row.original.logo ? (
                <div className="table-logo-container">
                  <img
                    src={`http://127.0.0.1:8000/${row.original.logo}`}
                    alt="Logo"
                    className="table-logo-image"
                  />
                </div>
              ) : (
                <span>N/A</span>
              )}
            </>
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created At",
      },
      {
        accessorKey: "updated_at",
        header: "Updated At",
      },
      {
        id: "actions",
        header: "Actions",
        size: 200,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          style: { textAlign: "center" },
        },
        Cell: ({ row }) => {
          const site = row.original;
          const handleViewDashboard = () => {
            Cookies.set("viewsite", "visitor");
            navigate("/site/dashboard");
          };
          // const handleEditClick = (site: SiteData) => {
          //   console.log("Edit", site);
          //   setSelectedSite(site);
          // };
          const handleDelete = () => console.log("Delete", row.original);

          return (
            <div className="flex space-x-7">
              <Button
                variant="primary"
                size="sm"
                onClick={handleViewDashboard}
                className="mb-2 mr-2"
              >
                View Dashboard
              </Button>
              {role === "admin" && (
                <>
                  <Button variant="pending" size="sm"
                    onClick={() => {
                      handleEditClick(site);
                    }}>
                    <Lucide icon="Pencil" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteSite(site)}
                    className="mb-2 mr-2"
                  >
                    <Lucide icon="Trash" className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mb-2 mr-5"
                    onClick={() => handleViewSite(site)}
                  >
                    <Lucide icon="Eye" className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
      {
        id: "devices",
        header: "Device Actions",
        size: 140,
        Cell: ({ row }) => {
          const handleClick = (siteId: number) => {
            setSelectedSiteId(siteId);
            setDevicesHeaderFooterSlideoverPreview(true);
          };

          const handleViewClick = (siteId: number) => {
            navigate(`/devices/${siteId}`);
            console.log('Button clicked! Site ID:', siteId);
          };

          return (
            <div className="flex space-x-7">
              {role === "admin" && (
                <>
                  <Button
                    variant="pending"
                    size="sm"
                    className="mb-2 mr-2"
                    onClick={() => handleClick(row.original.id)} // Call handleClick with the site ID
                  >
                    <Lucide icon="Plus" className="w-5 h-5" />
                  </Button>
                </>
              )}
              <Button
                variant="success"
                size="sm"
                className="mb-2 mr-2"
                onClick={() => handleViewClick(row.original.id)} // Call handleViewClick with the site ID
              >
                <Lucide icon="Eye" className="w-5 h-5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [role, navigate]
  );

  const table = useMaterialReactTable({
    columns,
    data: sitesData,
    enableDensityToggle: true,
    enablePagination: false,
    initialState: {
      columnPinning: { left: ['sno', 'site_name'], right: ['actions', 'devices'] },
      density: 'compact',
    },
    muiTablePaperProps: {
      elevation: 0,
      style: {
        boxShadow: 'none',
        borderRadius: '15px',
        maxHeight: '700px',
        overflowY: 'auto'
      },
    },
  });

  return (
    <>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Site Lists</h2>
          <Button variant="primary" onClick={() => setHeaderFooterSlideoverPreview(true)}>
            <Lucide icon="UserPlus" className="w-4 h-4 mr-2" />
            Add Site
          </Button>
        </div>
        {sitesData ? (
          <MaterialReactTable table={table} />
        ) : (
          <div>Loading...</div>
        )}
      </div>

      {/* Add Site Slideover */}
      <Slideover open={headerFooterSlideoverPreview} onClose={() => setHeaderFooterSlideoverPreview(false)}>
        <Slideover.Panel className="w-[90%] sm:w-[460px]">
          <Slideover.Title className="border-b p-4">
            <h2 className="text-base font-medium">Add Site</h2>
            <button onClick={() => setHeaderFooterSlideoverPreview(false)} className="absolute top-4 right-4">
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

            <form onSubmit={handleFormSubmit}>
              <div>
                <FormLabel>Username</FormLabel>
                <FormInput
                  id="username"
                  placeholder="Enter the username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <FormLabel>Sitename</FormLabel>
                <FormInput
                  id="sitename"
                  placeholder="Enter the site name"
                  value={formData.sitename}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <FormLabel>Password</FormLabel>
                <FormInput
                  id="hashed_password"
                  type="password"
                  placeholder="Enter the password"
                  value={formData.hashed_password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <FormLabel>Email</FormLabel>
                <FormInput
                  id="email"
                  type="email"
                  placeholder="Enter the email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <FormLabel>Phone Number</FormLabel>
                <FormInput
                  id="phone"
                  placeholder="Enter the phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <FormLabel>Logo Upload</FormLabel>
                <input
                  type="file"
                  onChange={(e) => e.target.files && setLogo(e.target.files[0])}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                // required
                />
              </div>

              <div>
                <FormLabel>Documents Upload (Max 4)</FormLabel>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                  disabled={documents.length >= 4}
                />
                <div className="mt-2">
                  {documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleFileDelete(file.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Lucide icon="X" className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <FormLabel>Select State</FormLabel>
                <TomSelect
                  value={formData.state}
                  onChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                  options={[
                    { value: '1', text: 'Tamil Nadu' },
                    { value: '2', text: 'Andhra Pradesh' }
                  ]}
                />
              </div>

              <div>
                <FormLabel>City</FormLabel>
                <FormInput
                  id="city"
                  placeholder="Enter the city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <FormLabel>Address</FormLabel>
                <FormTextarea
                  id="address"
                  placeholder="Enter the address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <FormLabel>Select Aggregator</FormLabel>
                <TomSelect
                  value={formData.aggregator_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, aggregator_id: value }))}
                  options={aggregators.map(aggregator => ({
                    value: aggregator.id, // Adjust based on your API response structure
                    text: aggregator.id // Adjust based on your API response structure
                  }))}
                />
              </div>

              <div>
                <FormLabel>Select Industry</FormLabel>
                <TomSelect
                  value={formData.industry_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, industry_id: value }))}
                  options={[
                    { value: '', text: 'Industry 1' }
                  ]}
                />
              </div>
              <div>
                <FormLabel>Auth Key</FormLabel>
                <input
                  type="text"
                  value={authKey}
                  readOnly
                  className="border rounded p-2 mb-2 w-full" // Added mb-2 for margin below the input
                  placeholder="Generated Auth Key"
                />
                <div className="flex space-x-2"> {/* Added space-x-2 for spacing between buttons */}
                  <div className='button bg-primary text-white p-2 rounded-md cursor-pointer' style={{ userSelect: "none" }} onClick={generateAuthKey}>
                    Generate New Key
                  </div>
                  <div className='button bg-danger text-white p-2 rounded-md cursor-pointer' style={{ userSelect: "none" }} onClick={resetAuthKey}>
                    Reset Key
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="pending"
                  type="button"
                  onClick={() => {
                    setFormData({
                      username: "",
                      sitename: "",
                      hashed_password: "",
                      email: "",
                      phone: "",
                      city: "",
                      address: "",
                      state: "",
                      aggregator_id: "",
                      industry_id: "",
                      auth_key: '',
                    });
                    setAuthKey('');
                    setLogo(null);
                    setDocuments([]);
                    setValidationErrors([]);
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </form>
          </Slideover.Description>
        </Slideover.Panel>
      </Slideover>

      {/* Edit Site Slideover */}
      <Slideover open={!!selectedSite} onClose={() => setSelectedSite(null)}>
        <Slideover.Panel
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        // className="bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <Slideover.Title className="text-lg font-bold p-5 border-b">
              Edit Site - {selectedSite?.site_uid}
            </Slideover.Title>

            <div className="flex-1 overflow-y-auto p-5">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Username & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Username</FormLabel>
                    <FormInput
                      name="username"
                      value={formDataEdit.username}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <FormLabel>Email</FormLabel>
                    <FormInput
                      type="email"
                      name="email"
                      value={formDataEdit.email}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>

                {/* Site Name */}
                <div>
                  <FormLabel>Site Name</FormLabel>
                  <FormInput
                    name="site_name"
                    value={formDataEdit.site_name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                {/* Phone & Logo */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Phone</FormLabel>
                    <FormInput
                      name="phone"
                      value={formDataEdit.phone}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <FormLabel>Logo</FormLabel>
                    <FormInput
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('logo', e.target.files)}
                    />
                    {formDataEdit.logo && (
                      <div className="mt-2">
                        {typeof formDataEdit.logo === 'string' ? (
                          <img
                            src={`http://127.0.0.1:8000/${formDataEdit.logo}`}
                            alt="Current logo"
                            className="max-w-[200px] h-auto border rounded"
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(formDataEdit.logo)}
                            alt="New logo preview"
                            className="max-w-[200px] h-auto border rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <FormLabel>City</FormLabel>
                    <FormInput
                      name="city"
                      value={formDataEdit.city}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <FormLabel>State</FormLabel>
                    <FormInput
                      name="state"
                      value={formDataEdit.state}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <FormLabel>Address</FormLabel>
                    <FormInput
                      name="address"
                      value={formDataEdit.address}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                {/* IDs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Aggregator ID</FormLabel>
                    <TomSelect
                      value="aggregator_id"
                      onChange={(value) => SetAggreatorSelect(value)}
                      options={{ placeholder: 'Select an aggregator' }}
                      className="w-full"
                    >
                      <option value="Aggreator 1">Aggreator 1</option>
                      <option value="Aggreator 2">Aggreator 2</option>
                    </TomSelect>
                  </div>
                  <div>
                    <FormLabel>Industry ID</FormLabel>
                    <TomSelect
                      value={formDataEdit.industry_id}
                      onChange={(value) => setFormDataEdit({ ...formDataEdit, industry_id: value })}
                      options={[
                        { value: '', text: 'Industry 1' },
                      ]}
                    />
                  </div>
                </div>

                {/* Auth */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Auth Key</FormLabel>
                    <FormInput
                      name="auth_key"
                      value={formDataEdit.auth_key}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <FormLabel>Auth Expiry</FormLabel>
                    <FormInput
                      type="datetime-local"
                      name="auth_expiry"
                      value={formDataEdit.auth_expiry}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <FormLabel>Documents</FormLabel>
                  <FormInput
                    type="file"
                    multiple
                    onChange={(e) => {
                      console.log("Files selected:", e.target.files); // Log the selected files
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files); // Convert FileList to an array
                        setFormDataEdit((prev) => ({
                          ...prev,
                          documents: [...prev.documents, ...newFiles], // Append new files to the existing documents
                        }));
                      }
                    }}
                  />
                  {formDataEdit.documents.length > 0 && (
                    <div className="text-xs mt-1 space-y-2">
                      <span className="block text-gray-600">Current documents:</span>
                      {formDataEdit.documents.map((doc, index) => {
                        console.log("Rendering document:", doc); // Log each document being rendered

                        // Extract the file name
                        const fileName = typeof doc === 'string' ? doc.split('/').pop() : doc.name;

                        return (
                          <div key={index} className="flex items-center justify-between hover:bg-gray-50 px-2 py-1 rounded">
                            <div className="flex items-center gap-2">
                              {/* Display the file name and a PDF icon (or any other format) */}
                              <span className="flex items-center text-gray-600">
                                <Lucide icon="FileText" className="w-4 h-4 mr-1" /> {/* PDF icon */}
                                {fileName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* View Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  console.log("Viewing document:", doc);
                                  const fileUrl = typeof doc === 'string'
                                    ? `http://127.0.0.1:8000/${doc}`
                                    : URL.createObjectURL(doc);
                                  window.open(fileUrl, '_blank'); // Open the document in a new tab
                                }}
                                className="text-primary hover:text-blue-700"
                              >
                                <Lucide icon="Eye" className="w-4 h-4" /> {/* View icon */}
                              </button>

                              {/* Cancel Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  console.log("Removing document at index:", index); // Log the index of the document being removed
                                  setFormDataEdit((prev) => ({
                                    ...prev,
                                    documents: prev.documents.filter((_, i) => i !== index), // Remove the document at the specified index
                                  }));
                                }}
                                className="text-danger hover:text-red-700"
                              >
                                <Lucide icon="X" className="w-4 h-4" /> {/* Cancel icon */}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Created At</FormLabel>
                    <FormInput
                      value={selectedSite?.created_at}
                      disabled
                    />
                  </div>
                  <div>
                    <FormLabel>Updated At</FormLabel>
                    <FormInput
                      value={selectedSite?.updated_at}
                      disabled
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white pt-4 border-t">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedSite(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Slideover.Panel>
      </Slideover>

      {/* View Site Slideover */}
      <Slideover open={viewSlideoverPreview} onClose={() => setViewSlideoverPreview(false)}>
        <Slideover.Panel className="w-[90%] sm:w-[460px]">
          <Slideover.Title className="border-b p-4">
            <h2 className="text-base font-medium">Site Details</h2>
            <button
              onClick={() => setViewSlideoverPreview(false)}
              className="absolute top-4 right-4"
            >
              <Lucide icon="X" className="w-6 h-6 text-gray-500" />
            </button>
          </Slideover.Title>

          <Slideover.Description className="p-4 space-y-4">
            {selectedSite && (
              <form>
                <div>
                  <FormLabel>Username</FormLabel>
                  <FormInput value={selectedSite.username} readOnly />
                </div>

                <div>
                  <FormLabel>Site Name</FormLabel>
                  <FormInput value={selectedSite.site_name} readOnly />
                </div>

                <div>
                  <FormLabel>Password</FormLabel>
                  <FormInput
                    type="password"
                    value="••••••••"
                    readOnly
                  />
                </div>

                <div>
                  <FormLabel>Email</FormLabel>
                  <FormInput value={selectedSite.email} readOnly />
                </div>

                <div>
                  <FormLabel>Phone Number</FormLabel>
                  <FormInput value={`+91 ${selectedSite.phone}`} readOnly />
                </div>

                <div>
                  <FormLabel>Logo</FormLabel>
                  <img
                    src={`http://127.0.0.1:8000/${selectedSite.logo}`}
                    alt="Site Logo"
                    className="w-24 h-24 object-contain border rounded-md"
                  />
                </div>
                <div>
                  <FormLabel>Documents</FormLabel>
                  <a href={`http://127.0.0.1:8000/${selectedSite.documents}`} target="_blank" rel="noopener noreferrer">
                    <br />
                    {console.log(selectedSite.documents)}
                    View Document
                  </a>
                </div>
                <div>
                  <FormLabel>Address</FormLabel>
                  <FormTextarea value={selectedSite.address} readOnly />
                </div>

                <div>
                  <FormLabel>City</FormLabel>
                  <FormInput value={selectedSite.city} readOnly />
                </div>

                <div>
                  <FormLabel>State</FormLabel>
                  <FormInput
                    value={selectedSite.state === '1' ? 'Tamil Nadu' : 'Andhra Pradesh'}
                    readOnly
                  />
                </div>

                <div>
                  <FormLabel>Aggregator ID</FormLabel>
                  <FormInput
                    value={selectedSite.aggregator_id?.toString() || 'N/A'}
                    readOnly
                  />
                </div>

                <div>
                  <FormLabel>Industry ID</FormLabel>
                  <FormInput
                    value={selectedSite.industry_id?.toString() || 'N/A'}
                    readOnly
                  />
                </div>

                <div>
                  <FormLabel>Created At</FormLabel>
                  <FormInput value={formatDate(selectedSite.created_at)} readOnly />
                </div>
              </form>
            )}
          </Slideover.Description>
        </Slideover.Panel>
      </Slideover>

      {/* Add Devices Side panel */}
      <Slideover staticBackdrop open={devicesheaderFooterSlideoverPreview}
        onClose={() => setDevicesHeaderFooterSlideoverPreview(false)}>
        <Slideover.Panel>
          <form onSubmit={handleDeviceSubmit}>
            <a onClick={(e) => {
              e.preventDefault();
              setDevicesHeaderFooterSlideoverPreview(false);
            }} className="absolute top-0 left-0 right-auto mt-4 -ml-12" href="#">
              <Lucide icon="X" className="w-8 h-8 text-slate-400" />
            </a>
            <Slideover.Title>
              <h2 className="mr-auto text-base font-medium">Add Device</h2>
            </Slideover.Title>

            <Slideover.Description>
              <div className="space-y-4">
                <div>
                  <FormLabel htmlFor="device-uid">Device Uid</FormLabel>
                  <FormInput
                    id="device-uid"
                    value={deviceFormData.device_uid}
                    onChange={(e) => setDeviceFormData({ ...deviceFormData, device_uid: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <FormLabel htmlFor="device-name">Device Name</FormLabel>
                  <FormInput
                    id="device-name"
                    value={deviceFormData.device_name}
                    onChange={(e) => setDeviceFormData({ ...deviceFormData, device_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <FormLabel htmlFor="device-type">Device Type</FormLabel>
                  <FormInput
                    id="device-type"
                    value={deviceFormData.device_type}
                    onChange={(e) => setDeviceFormData({ ...deviceFormData, device_type: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <FormLabel htmlFor="chip-id">Chip Id</FormLabel>
                  <FormInput
                    id="chip-id"
                    value={deviceFormData.chip_id}
                    onChange={(e) => setDeviceFormData({ ...deviceFormData, chip_id: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <FormLabel htmlFor="longitude">Longitude</FormLabel>
                  <FormInput
                    id="longitude"
                    type="number"
                    step="any"
                    value={deviceFormData.longitude}
                    onChange={(e) => setDeviceFormData({ ...deviceFormData, longitude: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <FormLabel htmlFor="latitude">Latitude</FormLabel>
                  <FormInput
                    id="latitude"
                    type="number"
                    step="any"
                    value={deviceFormData.latitude}
                    onChange={(e) => setDeviceFormData({ ...deviceFormData, latitude: e.target.value })}
                    required
                  />
                </div>
              </div>
            </Slideover.Description>

            <Slideover.Footer>
              <Button
                variant="pending"
                type="button"
                className="w-20 mr-1"
                onClick={() => setDeviceFormData({
                  site_id: '',
                  device_uid: '',
                  device_name: '',
                  device_type: '',
                  chip_id: '',
                  longitude: '',
                  latitude: ''
                })}
              >
                Clear
              </Button>
              <Button variant="primary" type="submit" className="w-20">
                Submit
              </Button>
            </Slideover.Footer>
          </form>
        </Slideover.Panel>
      </Slideover>
    </>
  );
}

export default Index;