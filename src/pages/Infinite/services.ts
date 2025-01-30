import axios from 'axios';
const getData = async ()=>{
    try
    {
        const response = await axios.get('https://dummyjson.com/products');
        return response.data;
    }
    catch(err)
    {
        console.error("Fetch data error from API Call :", err);
    }
}
export {getData};