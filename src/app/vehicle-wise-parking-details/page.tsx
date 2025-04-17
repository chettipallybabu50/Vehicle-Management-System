
"use client"
import React, { useEffect, useState } from 'react'
import Styles from './vehicleWise.module.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell, Rectangle, } from "recharts";
import { FaDownload, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';


interface vechiclesdata {
  two_wheeler: number;
  four_wheeler: number;
}
interface basementwisevehicledata{
  basement_name: string;
  two_wheeler: number;
  four_wheeler: number
}

interface vehiclsallocatedData{
  basement_name: string;
  two_wheeler: number;
  four_wheeler: number
}
interface Basement {
  BasementID: number;
  Basement_Name: string;
}
interface basementcompanyvehicleData{
  company_name: string;
  two_wheeler:number;
  four_wheeler: number;
}
interface Comapanies{
  TenantID: number;
  tenant_name: string;
}
interface companyBesementvehicledata{
  Basement_Name: string;
  two_wheeler:number;
  four_wheeler: number;
}

export default function vehicleWise() {
  const [totalvehicledata, settotalvehicledata] = useState<vechiclesdata[]>([])
  const [totalbasementvehicedata, settotalbasementvehicedata]=useState<basementwisevehicledata[]>([])
  const [allocatedvehiclesData, setallocatedvehiclesData] = useState<vehiclsallocatedData[]>([])
  const [basements, setBasements] = useState<Basement[]>([]);
  const [comapaniesData, setcomapanies] = useState<Comapanies[]>([]);
  const [basemetcompanyvehicle, setbasemetcompanyvehicle]= useState<basementcompanyvehicleData[]>([])
  const [companydataByidvehicle, setcompanydataByidvehicle]= useState<companyBesementvehicledata[]>([])
  const [loading, setLoading] = useState(false);
  const [loadingForcomapnyview, setloadingForcomapnyview] = useState(false);
  const [componentloading, setcomponentloading] = useState(false)
  const [loading_total, setloading_total] = useState(false);

 
  useEffect(() => {

    getvehicleWiseparkingdata();
    getbasementslist();
  }, []);

  const getvehicleWiseparkingdata = async () => {
    setcomponentloading(true)
    try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getvehiclewiseparkingdata`);
    if (!response.ok) throw new Error("Failed to fetch data");

    const { vehiclewiseData, basementwisevehicledata } = await response.json();
    const formatingvehicledata = vehiclewiseData.map((item: any) => ({

      two_wheeler: item.total_two_wheeler_slots,
      four_wheeler: item.total_four_wheeler_slots
    }))
    settotalvehicledata(formatingvehicledata)

    const formatbasementvehicledata=  basementwisevehicledata.map((item:any)=>({
      basement_name:item.Basement_Name,
      two_wheeler: item.two_heeler_slots,
      four_wheeler: item.four_wheeler_slots
    }))
    settotalbasementvehicedata(formatbasementvehicledata)

    const formatvehicledata = basementwisevehicledata.map((item:any)=>({
      basement_name:item.Basement_Name,
      two_wheeler: item.Two_wheeler_allocated,
      four_wheeler: item.Four_wheeler_allocated
    }))
    console.log('---->>formatvehicledata', formatvehicledata)
    setallocatedvehiclesData(formatvehicledata)
  }
  catch(error){
    console.error('Error fetching vehicle data:', error);
  }
  finally{
    setcomponentloading(false)

  }

  }

  const getbasementslist = async ()=>{
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getbasementsAndcompaniesList`);
    if (!response.ok) throw new Error("Failed to fetch data");

    const { basementdata, companiesList } = await response.json();
    console.log('---->>basementsList', basementdata)
    console.log('---->>companiesList', companiesList)
    setBasements(basementdata);
    const firstBasementId = basementdata[0].BasementID.toString();
    console.log('---->>firstBasementId', firstBasementId)
    getvehicledetailsbyId(firstBasementId)
    setcomapanies(companiesList)
    const firstTenantId = companiesList[0].TenantID.toString()
    console.log('---->>firstTenantId', firstTenantId)
    getTenantbyId(firstTenantId)

  }

  const CustomTooltip = ({active,payload,label,}: {active?: boolean;payload?: any[];label?: string; }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <p><strong>Basement:</strong> {label}</p>
          <p style={{ color: "#F8766D" }}>
            🚲 Two-Wheelers: {payload[0]?.value}
          </p>
          <p style={{ color: "#7CAE00" }}>
            🚗 Four-Wheelers: {payload[1]?.value}
          </p>
        </div>
      );
    }
  
    return null;
  };

  const Selectionofbasement = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const BasementId = event.target.value; // <-- this is the selected basement ID
    console.log("Selected Basement ID:", BasementId);
    if(BasementId){
      getvehicledetailsbyId(BasementId)
    }

   
  };

  const getvehicledetailsbyId = async (BasementId: any) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getparkingdetailsBybasementId?BasementId=${encodeURIComponent(BasementId)}`
      );
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      const { data } = await response.json();
      console.log('vehicledata', data)

      const formatDetailedviewbasement = data.map((item: any) => ({
        company_name: item.Company_name,
        two_wheeler: item.two_wheeler_slots_reserved,
        four_wheeler: item.four_wheeler_slots_reserved,
        basement_reserved_slots: item.basement_reserved_slots
      }))
      console.log('---->>formatDetailedviewbasement', formatDetailedviewbasement)
      setbasemetcompanyvehicle(formatDetailedviewbasement)
    }
    catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
    finally {
      setLoading(false); // Hide loader
    }

  }

  const Selectionofcompany  =(event: React.ChangeEvent<HTMLSelectElement>) =>{
    const TenantID = event.target.value; // <-- this is the selected basement ID
    console.log("Selected TenantID ID:", TenantID);
    if(TenantID){
      getTenantbyId(TenantID)

    }

  }

  const getTenantbyId = async (TenantID: any) =>{
    setloadingForcomapnyview(true)
    try{
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getCompanybyId?TenantID=${encodeURIComponent(TenantID)}`
      );
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const { databyId } = await response.json();
      console.log('vehicledata', databyId)

      const formatDetailedcompanyView = databyId.map((item: any) => ({
        Basement_Name: item.Basement_Name,
        two_wheeler: item.two_wheeler_slots_reserved,
        four_wheeler: item.four_wheeler_slots_reserved
      }))
      console.log('---->>formatDetailedcompanyView', formatDetailedcompanyView)
      setcompanydataByidvehicle(formatDetailedcompanyView)

    }catch(error){
      console.error('Error fetching vehicle data:', error);

    }finally{
      setloadingForcomapnyview(false)

    }

  }

  // const getvehicledetailsbyId = async (BasementId: any) => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/getparkingdetailsBybasementId?BasementId=${encodeURIComponent(BasementId)}`
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to download file");
  //     }
  //     const { data } = await response.json();
  //     console.log('vehicledata', data)

  //     const formatDetailedviewbasement = data.map((item: any) => ({
  //       company_name: item.Company_name,
  //       two_wheeler: item.two_wheeler_slots_reserved,
  //       four_wheeler: item.four_wheeler_slots_reserved
  //     }))
  //     console.log('---->>formatDetailedviewbasement', formatDetailedviewbasement)
  //     setbasemetcompanyvehicle(formatDetailedviewbasement)
  //   }
  //   catch (error) {
  //     console.error('Error fetching vehicle data:', error);
  //   }
  //   finally {
  //     setLoading(false); // Hide loader
  //   }

  // }

  const CustomTooltip_two = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
  
      return (
        <div style={{ background: 'white', padding: '10px', border: '1px solid #ccc' }}>
          <p style={{ fontWeight: 'bold', color: '#3f51b5' }}>Company: {label}</p>
          <p style={{ color: '#F8766D' }}>two_wheeler : {data.two_wheeler}</p>
          <p style={{ color: '#7CAE00' }}>four_wheeler : {data.four_wheeler}</p>
          <p style={{ color: '#FF8C00', margin: '4px 0' }}>Reserved Slots: {data.basement_reserved_slots}</p> {/* ✅ New line */}
        </div>
      );
    }
    return null;
  };

  const downloadvehicleReport = async (Type: string) => {
    console.log('--->>Type', Type)
    if(Type== 'Total'){
      setloading_total(true)

    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vehicleReportdownload?Type=${encodeURIComponent(Type)}`
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      let filename = "Total_vehicle_wise_report";
      const contentDisposition = response.headers.get("Content-Disposition");
      console.log('---->>contentDisposition', contentDisposition)
      if (contentDisposition) {
        console.log('---->> in side if contentDisposition', contentDisposition)
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Name of the downloaded file
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download successful!');

    } catch (error) {

    }
    finally {
      setloading_total(false)

    }


  }
  
  
  
  return (
    <div className={Styles.vechicleComtainer}>
      <div>
        <h3>Parking Details Vehicle Wise</h3>
      </div>

      <div>
        {componentloading ?
          (<div className={Styles.LoaderOne}>
            <FaSpinner className={Styles.animatespin} size={30} />
          </div>
          )
          : (
            <div className={Styles.graphcontainer}>
              {/* <div className={Styles.graphsstyles}>
                <p className={Styles.graphHeading}> Total Vehicles in N-Heights Buiding</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={totalvehicledata} barGap={50} >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="two_wheeler" fill="#F8766D" barSize={30} />
                    <Bar dataKey="four_wheeler" fill="#7CAE00" barSize={30} />
                  </BarChart>
                </ResponsiveContainer> 
              </div> */}




              <div className={Styles.graphsstyles}>
                <div className={Styles.headingandselectcontainer}>
                  <p className={Styles.graphHeading}> Total Capacity of a Basement</p>
                  {loading_total ? (
                    <FaSpinner className={Styles.animatespin} size={20} />
                  ) : (
                    <button className={Styles.vbtn}
                      onClick={() => downloadvehicleReport('Total')}>
                      <FaDownload />
                    </button>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={totalbasementvehicedata}  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="basement_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="two_wheeler" fill="#F8766D" activeBar={<Rectangle fill="pink" stroke="blue" />} barSize={30} />
                    <Bar dataKey="four_wheeler" fill="#7CAE00" activeBar={<Rectangle fill="gold" stroke="purple" />} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={Styles.graphsstyles}>
                <div className={Styles.headingandselectcontainer}>
                  <p className={Styles.graphHeading}> Allocated Vehicles in a Basement</p>
                  <button className={Styles.vbtn}>
                    <FaDownload />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={allocatedvehiclesData}  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="basement_name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="two_wheeler" fill="#F8766D" activeBar={<Rectangle fill="pink" stroke="blue" />} barSize={30} />
                    <Bar dataKey="four_wheeler" fill="#7CAE00" activeBar={<Rectangle fill="gold" stroke="purple" />} barSize={30} />
                    {/* <Bar dataKey="4-Wheeler" fill="#82ca9d" /> */}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={Styles.graphsstyles}>
                <div className={Styles.headingandselectcontainer}>
                  <p className={Styles.graphHeading}> Basement Selection Wise</p>
                  <div className={Styles.Basebtn}>
                    <button className={Styles.vbtn}>
                      <FaDownload />
                    </button>
                    <select name="basements" id="basements" className={Styles.basementSelection}
                      onChange={Selectionofbasement}>
                      {basements.map((basement) => (
                        <option key={basement.BasementID} value={basement.BasementID}>
                          {basement.Basement_Name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {loading ? (
                  // <FaSpinner className={Styles.animatespin} size={20} />
                  <div className={Styles.loaderWrapper}>
                    <FaSpinner className={Styles.animatespin} size={30} />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={basemetcompanyvehicle}  >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="company_name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip_two />}/>
                      <Legend />
                      <Bar dataKey="two_wheeler" fill="#F8766D" activeBar={<Rectangle fill="pink" stroke="blue" />} barSize={30} />
                      <Bar dataKey="four_wheeler" fill="#7CAE00" activeBar={<Rectangle fill="gold" stroke="purple" />} barSize={30} />
                      {/* <Bar dataKey="4-Wheeler" fill="#82ca9d" /> */}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className={Styles.graphsstyles}>
                <div className={Styles.headingandselectcontainer}>
                  <p className={Styles.graphHeading}> Company Selection Wise</p>
                  <div className={Styles.Basebtn}>
                    <button className={Styles.vbtn}>
                      <FaDownload />
                    </button>
                    <select name="companies" id="companies" className={Styles.basementSelection}
                      onChange={Selectionofcompany}>
                      {comapaniesData.map((company) => (
                        <option key={company.TenantID} value={company.TenantID}>
                          {company.tenant_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {loadingForcomapnyview ? (
                  // <FaSpinner className={Styles.animatespin} size={20} />
                  <div className={Styles.loaderWrapper}>
                    <FaSpinner className={Styles.animatespin} size={30} />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={companydataByidvehicle}  >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Basement_Name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="two_wheeler" fill="#F8766D" activeBar={<Rectangle fill="pink" stroke="blue" />} barSize={30} />
                      <Bar dataKey="four_wheeler" fill="#7CAE00" activeBar={<Rectangle fill="gold" stroke="purple" />} barSize={30} />
                      {/* <Bar dataKey="4-Wheeler" fill="#82ca9d" /> */}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>
          )}
      </div>

    </div>
  )
}
