import { useEffect, useMemo, useState } from 'react';
//Material React Table
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
//React router dom
import { useNavigate } from 'react-router-dom';
//Js-Cookies
import Cookies from 'js-cookie';


//Template Imports
import Button from "@/components/Base/Button"
//import Menu from "@/components/Base/Headless/Menu"
import Lucide from "@/components/Base/Lucide"
import Slideover from '@/components/Base/Headless/Slideover';
import { FormInput, FormLabel } from '@/components/Base/Form';

interface AggregatorData {
  aggregator_id: int;
  username: string;
  aggregator_name: string;
  hashed_password: string;
  email: string;
  phone: string;
  logo: string;
}

// const data: any[] = [
//   {
//     aggreatorname: "Aggreator 1",
//     email: "aggreator@gmail.com",
//     phone_no: "+91 98765 43210",
//     logo: "https://salieabs.com/wp-content/uploads/2024/07/Salieabs_logo.png",
//     // authorized_key: 'user_001',
//     createdAt: '08-01-2025 10:00 AM',
//     updatedAt: '08-01-2025 11:00 PM'
//   }
// ];

function index() {
  const [aggregatorsData, setAggregatorsData] = useState<AggregatorData[]>([]);
  const [selectedAggregator, setSelectedAggregator] = useState<AggregatorData | null>(null);
  const [role, setRole] = useState<string>("");
  const [aggregatorFormData, setAggregatorFormData] = useState({
    username: '',
    aggregatorname: '',
    hashed_password: '',
    email: '',
    phone: '',
    logo: null as File | null,
  });
  const [headerFooterSlideoverPreview, setHeaderFooterSlideoverPreview] = useState(false);
  const [headerFooterEditSlideoverPreview, setHeaderFooterEditSlideoverPreview] = useState(false);
  const [formData, setFormData] = useState({
    aggregator_id: '',
    username: '',
    aggregatorname: '',
    hashed_Password: '',
    email: '',
    phone: '',
    logo: null as File | null,
  });
  const [aggregatorId, setAggregatorId] = useState(null);

  const fetchAggregatorData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/aggregator/all');
      const responseJson = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAggregators = async () => {
      try {
        const data = await fetchAggregatorData();
        setAggregatorsData(data);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchAggregators();
    const roles = Cookies.get('roles');
    if (roles) setRole(roles);
    Cookies.remove('viewsite');
  }, []);

  const deleteAggregator = async (aggregator: AggregatorData) => {
    if (!window.confirm('Are you sure you want to delete this aggregator?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/aggregator/delete/${aggregator.id}`, { // Use aggregator.id
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the aggregators list after deletion
        const refreshResponse = await fetch('http://127.0.0.1:8000/api/aggregator/all');
        const { data } = await refreshResponse.json();
        setAggregatorsData(data);
        alert('Aggregator deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to delete aggregator');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting aggregator');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
  
    try {
      // Prepare the form data
      const formDataToSend = new FormData();
      formDataToSend.append('aggregator_id', formData.aggregator_id);
      formDataToSend.append('username', formData.username);
      formDataToSend.append('aggregator_name', formData.aggregator_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      if (formData.logo && typeof formData.logo !== 'string') {
        formDataToSend.append('logo', formData.logo[0]); // Append the file if it's a new file
      }
  
      // Log the form data being sent
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
  
      // Send the PUT request to the API
      const response = await fetch(
        `http://127.0.0.1:8000/api/aggregator/update/${formData.aggregator_id}`,
        {
          method: 'PUT',
          body: formDataToSend, // Use FormData for file uploads
        }
      );
      console.log("img update",formData.logo)
  
      // Log the response status and body
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response body:', result);
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update aggregator');
      }
  
      // Handle success (e.g., show a success message or redirect)
      alert('Aggregator updated successfully!');
    } catch (error) {
      console.error('Error updating aggregator:', error);
      alert(error.message || 'Failed to update aggregator. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };
  
  const handleAggregatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('username', aggregatorFormData.username);
      formData.append('aggregatorname', aggregatorFormData.aggregatorname);
      formData.append('hashed_password', aggregatorFormData.hashed_password);
      formData.append('email', aggregatorFormData.email);
      formData.append('phone', aggregatorFormData.phone);
      if (aggregatorFormData.logo) {
        formData.append('logo', aggregatorFormData.logo);
      }

      const response = await fetch('http://127.0.0.1:8000/api/aggregator/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.detail) {
          const messages = Array.isArray(errorData.detail)
            ? errorData.detail.map((err: any) => `${err.loc?.join('.')} ${err.msg}`).join('\n')
            : errorData.detail;
          throw new Error(messages);
        }
        throw new Error(errorData.message || 'Registration failed');
      }

      alert('Aggregator registered successfully!');
      // Reset form
      setAggregatorFormData({
        username: '',
        aggregatorname: '',
        hashed_password: '',
        email: '',
        phone: '',
        logo: null,
      });
      setHeaderFooterSlideoverPreview(false);
    } catch (error: any) {
      console.error('Full error:', error);
      alert(error.message || 'Aggregator registration failed. Check console.');
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAggregatorFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleEditFileChange = (name, files) => {
    if (name === 'documents') {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)]
      }));
    } else {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAggregatorFormData((prevState) => ({
        ...prevState,
        logo: e.target.files![0],
      }));
    }
  };
  //Go to devices link state
  const navigate = useNavigate();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        id: "sno", // Required when using accessorFn
        header: "#",
        size: 50, // Optional: Adjust column size
        Cell: ({ row }) => row.index + 1
      },
      {
        accessorKey: 'username', //access nested data with dot notation
        header: 'User Name',
        size: 100
      },
      {
        accessorKey: 'aggregator_name', //access nested data with dot notation
        header: 'Aggreator Name',
        size: 100
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 100
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number',
        size: 100
      },
      {
        accessorKey: 'logo',
        header: 'Logo',
        size: 50,
        Cell: ({ row }) => {
          return (
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
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'CreatedAt',
      },
      {
        accessorKey: 'updated_at',
        header: 'UpdatedAt',
      },
      {
        id: 'actions', // Action column
        header: 'Actions',
        Cell: ({ row }) => {
          const handleEdit = () => {
            // Set the form data with the row's original data
            const aggregatorData = {
              aggregator_id: row.original.id,
              username: row.original.username,
              aggregator_name: row.original.aggregator_name,
              hashed_password: row.original.hashed_password, // Note: Ensure the key matches your state
              email: row.original.email,
              phone: row.original.phone,
              logo: row.original.logo, // Handle logo separately if needed
            };
          
            // Log the aggregator data to the console
            console.log('Editing aggregator:', aggregatorData);
          
            // Set the form data
            setFormData(aggregatorData);
          
            // Open the slideover
            setHeaderFooterEditSlideoverPreview(true);
          };

          const handleDelete = () => {
            console.log('Delete', row.original);
            deleteAggregator(row.original); // Use row.original instead of aggregator
          };

          return (
            <div className="flex space-x-2">
              <Button variant="pending" size="sm" onClick={handleEdit} className="mb-2 mr-1">
                <Lucide icon="Pencil" className="w-5 h-5" />
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} className="mb-2 mr-1">
                <Lucide icon="Trash" className="w-5 h-5" />
              </Button>

            </div>
          );
        },
      }
    ],
    [],
  );
  const table = useMaterialReactTable({
    columns,
    data: aggregatorsData, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // enableColumnPinning: true,
    enableDensityToggle: true, // Enables density toggle in the toolbar
    initialState: {
      columnPinning: { left: ['sno', 'username'], right: ['actions', 'devices'] },
      density: 'compact', // Default density state
    },
    muiTablePaperProps: {
      elevation: 0, //Remove shadow
      style: {
        boxShadow: 'none',
        borderRadius: '15px'
      }
    }
  });
  // useEffect(()=>{
  //   Cookies.remove('viewsite');
  // });
  return (
    <>
      <div className="flex flex-col items-center mt-8 intro-y sm:flex-row">
        <h2 className="mr-auto text-lg font-medium">Aggreator Lists</h2>
        <div className="flex w-full mt-4 mb-5 sm:w-auto sm:mt-0">
          <Button variant="primary" className="mr-2 shadow-md" onClick={(event: React.MouseEvent) => {
            event.preventDefault();
            setHeaderFooterSlideoverPreview(true);
          }}>
            <Lucide icon="UserPlus" className="w-4 h-4 mr-2" />{" "}
            Add Aggreator
          </Button>
        </div>
      </div>
      <MaterialReactTable table={table} />

      {/*==============================
    Add User Side panel
  ==============================*/}
      {/* BEGIN: Slide Over Content */}
      <Slideover staticBackdrop open={headerFooterSlideoverPreview} onClose={() => {
        setHeaderFooterSlideoverPreview(false);
      }}
      >
        {/* BEGIN: Slide Over Header */}
        <Slideover.Panel>
          <a
            onClick={(event: React.MouseEvent) => {
              event.preventDefault();
              setHeaderFooterSlideoverPreview(false);
            }}
            className="absolute top-0 left-0 right-auto mt-4 -ml-12"
            href="#"
          >
            <Lucide icon="X" className="w-8 h-8 text-slate-400" />
          </a>
          <Slideover.Title>
            <h2 className="mr-auto text-base font-medium">Add Aggregator</h2>
          </Slideover.Title>
          <Slideover.Description>
            <form onSubmit={handleAggregatorSubmit}>
              <div>
                <FormLabel htmlFor="username">Username</FormLabel>
                <FormInput
                  id="username"
                  type="text"
                  placeholder="Enter the username"
                  value={aggregatorFormData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-3">
                <FormLabel htmlFor="aggregatorname">Aggregator Name</FormLabel>
                <FormInput
                  id="aggregatorname"
                  type="text"
                  placeholder="Enter the aggregator name"
                  value={aggregatorFormData.aggregatorname}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-3">
                <FormLabel htmlFor="hashed_password">Password</FormLabel>
                <FormInput
                  id="hashed_password"
                  type="password"
                  placeholder="Enter the password"
                  value={aggregatorFormData.hashed_password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-3">
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormInput
                  id="email"
                  type="text"
                  placeholder="Enter the email"
                  value={aggregatorFormData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-3">
                <FormLabel htmlFor="phone">Phone Number</FormLabel>
                <FormInput
                  id="phone"
                  type="text"
                  placeholder="Enter the phone number"
                  value={aggregatorFormData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-3">
                <FormLabel htmlFor="logo">Logo Upload</FormLabel>
                <input
                  id="logo"
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
              <Slideover.Footer>
                <Button variant="pending" type="button" className="w-20 mr-1" onClick={() => setAggregatorFormData({
                  username: '',
                  aggregatorname: '',
                  hashed_password: '',
                  email: '',
                  phone: '',
                  logo: null,
                })}>
                  Clear
                </Button>
                <Button variant="primary" type="submit" className="w-20">
                  Submit
                </Button>
              </Slideover.Footer>
            </form>
          </Slideover.Description>
        </Slideover.Panel>
        {/* END: Slide Over Footer */}
      </Slideover>
      {/* END: Slide Over Content */}

      {/* Edit Aggregator */}
      <Slideover
        staticBackdrop
        open={headerFooterEditSlideoverPreview}
        onClose={() => {
          setHeaderFooterEditSlideoverPreview(false);
        }}
      >
        {/* BEGIN: Slide Over Header */}
        <Slideover.Panel>
          <a
            onClick={(event) => {
              event.preventDefault();
              setHeaderFooterEditSlideoverPreview(false);
            }}
            className="absolute top-0 left-0 right-auto mt-4 -ml-12"
            href="#"
          >
            <Lucide icon="X" className="w-8 h-8 text-slate-400" />
          </a>
          <Slideover.Title>
            <h2 className="mr-auto text-base font-medium">Edit Aggregator</h2>
          </Slideover.Title>
          <Slideover.Description>
            <form onSubmit={handleEditSubmit}>
            <div>
                <FormLabel htmlFor="aggregator-id">Aggregator Id</FormLabel>
                <FormInput id="aggregator_id" type="text" placeholder="Enter the aggregator_id" value={formData.aggregator_id} onChange={handleChange} />
              </div>
              <div>
                <FormLabel htmlFor="username">Username</FormLabel>
                <FormInput id="username" type="text" placeholder="Enter the username" value={formData.username} onChange={handleChange} />
              </div>
              <div className="mt-3">
                <FormLabel htmlFor="aggregator-name">Aggregator Name</FormLabel>
                <FormInput id="aggregator_name" type="text" placeholder="Enter the aggregator name" value={formData.aggregator_name} onChange={handleChange} />
              </div>
              {/* <div className="mt-3">
            <FormLabel htmlFor="hashed_password">Password</FormLabel>
            <FormInput id="hashed_password" type="password" placeholder="Enter the password" value={formData.hashed_password} onChange={handleChange} />
          </div> */}
              <div className="mt-3">
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormInput id="email" type="text" placeholder="Enter the email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="mt-3">
                <FormLabel htmlFor="phone">Phone Number</FormLabel>
                <FormInput id="phone" type="text" placeholder="Enter the phone number" value={formData.phone} onChange={handleChange} />
              </div>
              <div>
                <FormLabel>Logo</FormLabel>
                <FormInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditFileChange('logo', e.target.files)}
                />
                {formData.logo && (
                  <div className="mt-2">
                    {typeof formData.logo === 'string' ? (
                      <img
                        src={`http://127.0.0.1:8000/${formData.logo}`}
                        alt="Current logo"
                        className="max-w-[200px] h-auto border rounded"
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(formData.logo)}
                        alt="New logo preview"
                        className="max-w-[200px] h-auto border rounded"
                      />
                      
                    )}
                    {console.log(formData.logo)}
                  </div>
                )}
              </div>
              <Slideover.Footer>
                <Button variant="pending" type="button" className="w-20 mr-1">
                  Clear
                </Button>
                <Button variant="primary" type="submit" className="w-20">
                  Submit
                </Button>
              </Slideover.Footer>
            </form>
          </Slideover.Description>
        </Slideover.Panel>
        {/* END: Slide Over Footer */}
      </Slideover>
    </>
  )
}

export default index
