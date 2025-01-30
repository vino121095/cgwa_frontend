import { useEffect, useState, useMemo } from 'react'
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
//Sevices
import {getData} from './services'
function index() {
  //Data State
  const [data, setData] = useState<any[]>([]);
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        id: 'sno',
        header : '#',
        Cell : ({row})=> row.index + 1,
        size : 20
      },
      {
        accessorKey: 'title', //access nested data with dot notation
        header: 'Product Title',
        size: 150,
      },
      {
        accessorKey : 'description',
        header : 'Description',
        size : 150
      }
    ],
    [],
  );
  const fetchdata = async()=>{
    try
    {
      const result = await getData();
      setData(result.products);
      //console.log(result);
    }
    catch(err)
    {
      console.log("Api Call from components :", err);
    }
  }

  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    initialState : {
       density : 'compact'
    }
  });

  useEffect(()=>{
    fetchdata();
  },[]);
  return (
    <>
      <h1>Sample Data Inifite scroll</h1>
      <MaterialReactTable table={table} />
    </>
  )
}

export default index
