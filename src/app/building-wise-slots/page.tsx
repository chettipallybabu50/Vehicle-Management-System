"use client"
import React, { useState ,useEffect } from 'react'
import Styles from './building.module.css'
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,LabelList, Cell,} from "recharts";
import { basename } from 'path';
import { BsDisplay } from 'react-icons/bs';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
interface totalbuildingparking {
  basename: string;
  capcity : number;
}
interface allocatedslots{
  id: number;
  bacement: string;
  Alloccated: number;
}

interface FormattedDataforbasementsAndtenants {
  name: string;
  [key: string]: string | number;
}

interface basementsAndtenants{
  BasementName: string;
  [key: string]: string | number; 
}


const data1 = [
  { basement: "A", capacity: 50 },
  { basement: "B", capacity: 40 },
  { basement: "C", capacity: 60 },
  { basement: "D", capacity: 55 },
];
const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff6f61", "#ffb400", "#8d44ad"];


export default function Buidingwise() {
   const [TotalparkingSlots, setTotalparkingSlots] = useState<totalbuildingparking[]>([]);
   const [allocatedparkingslots, setAllocatedparkingslots] = useState<allocatedslots[]>([])
   const [tenanatsAndbasements, settenanatsAndbasements] = useState<FormattedDataforbasementsAndtenants[]>([])
   const [basementsAndTenantwise, setbasementsAndTenantwise] = useState<basementsAndtenants[]>([])
   const [isLoading, setIsLoading] = useState(false);
   const [isLoadingtwo, setisLoadingtwo] = useState(false);
   const [isLoadingthree, setisLoadingthree] = useState(false);
   const [isLoadingfour, setisLoadingfour] = useState(false);

  useEffect(() => {
    getsinglebuildingdata();
  }, []);
  // setTotalparkingSlots(data1)

const getsinglebuildingdata= async() =>{
  try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getsinglebuidingdetails`);
    if (!response.ok) throw new Error("Failed to fetch data");

    const { data, basement_and_tenats} = await response.json();
    console.log('---->>single building data ', data)
    console.log('---->>basement_and_tenats ', basement_and_tenats)
    const buildingTotalparlingslots = data.map((item: any) => ({
      id: item.BasementID,
      basement: item.Basement_Name, // Map Basement_Name to 'basement'
      capacity: item.no_of_slots // Map allocated_slots to 'capacity'
    })).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id);
    console.log('---->>>formattedData', buildingTotalparlingslots)
    setTotalparkingSlots(buildingTotalparlingslots)

    const allocatedslotsbasement = data.map((item: any) => ({
      id: item.BasementID,
      basement: item.Basement_Name,
      Allocated: item.allocated_slots
    })).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id);
    console.log('---->>>allocatedslotsbasement', allocatedslotsbasement)
    setAllocatedparkingslots(allocatedslotsbasement)

    

    const formattedData: FormattedDataforbasementsAndtenants[] = Object.values(
      basement_and_tenats.reduce((acc: { [key: string]: any }, item: { tenant_name: any; Basement_Name: any; basement_reserved_slots: any; }) => {
        const { tenant_name, Basement_Name, basement_reserved_slots } = item;
    
        if (!acc[tenant_name]) {
          acc[tenant_name] = { tenant_name };
        }
    
        acc[tenant_name][Basement_Name] =
          (acc[tenant_name][Basement_Name] || 0) + Number(basement_reserved_slots);
    
        return acc;
      }, {})
    );
    
    console.log('FormattedDataforbasementsAndtenants',formattedData);
    settenanatsAndbasements(formattedData)

    const formatForbasementAndtenant :basementsAndtenants[]= Object.values(
      basement_and_tenats.reduce((acc: { [key: string]: any }, item: { tenant_name: any; Basement_Name: any; basement_reserved_slots: any; }) => {
        const { tenant_name, Basement_Name, basement_reserved_slots } = item;

        console.log("🔹 Processing Item:", item);
        const cleanBasementName = Basement_Name.trim();
    
        if (!acc[cleanBasementName]) {
          acc[cleanBasementName] = { BasementName: cleanBasementName };
          console.log(`✅ Created new entry for ${cleanBasementName}:`, acc[cleanBasementName]);
        }
    
        acc[cleanBasementName][tenant_name] =
          (acc[cleanBasementName][tenant_name] || 0) + Number(basement_reserved_slots);
          console.log(`🔄 Updated ${cleanBasementName} with ${tenant_name}:`, acc[cleanBasementName]);
    
        return acc;
      }, {})

    )

    formatForbasementAndtenant.sort((a, b) =>
      a.BasementName.localeCompare(b.BasementName)
    );
    
   
    console.log('formatForbasementAndtenant',formatForbasementAndtenant);
    setbasementsAndTenantwise(formatForbasementAndtenant)

    
    
    
    

  }catch(err){
    console.error("Error fetching parking data:", err);

  }
}

const downloadXcellReport = async (Type:string)=>{
  console.log('---->>TYpe ', Type )
  if(Type=='Total'){
    setIsLoading(true);
  }
  else if(Type=='Allocated'){
    setisLoadingtwo(true)
  }
  else if(Type=='CompanybasementWise'){
    setisLoadingthree(true)
  }else{
    setisLoadingfour(true)
  }
  // setIsLoading(true);
  try{
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/singlebuildingReport?Type=${encodeURIComponent(Type)}`
    );

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    let filename = "Single_building_slots.xlsx";
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

  }
  catch(error){
    console.log('---->error', error)
  }finally {
    setIsLoading(false);
    setisLoadingtwo(false)
    setisLoadingthree(false)
    setisLoadingfour(false)

  }
  

}
  return (
    <div className={Styles.buidingcontainer}>
      <h3>
        Parking Slots Details
      </h3>

      <div className={Styles.graphContainer}>

        <div className={Styles.customGraph}>
          <div className={Styles.graphDownload}>
            <h4 >Parking Capacity by Basement In Building</h4>
            <button className={Styles.btn} onClick={() => downloadXcellReport('Total')}>
              {/* <FaDownload /> */}
              {isLoading ? (
                <FaSpinner className={Styles.animatespin} size={20} />
              ) : (
                <FaDownload />
              )}
            </button>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TotalparkingSlots} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="basement" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="capacity" barSize={30} fill="#87CEEB">
                {/* {TotalparkingSlots.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))} */}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={Styles.customGraph}>
          <div className={Styles.graphDownload}>
            <h4 >Allocated Slots by Basement In Building</h4>
            <button className={Styles.btn} onClick={() => downloadXcellReport('Allocated')}>
              {isLoadingtwo ? (
                <FaSpinner className={Styles.animatespin} size={20} />
              ) : (
                <FaDownload />
              )}
            </button>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allocatedparkingslots} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="basement" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Allocated" barSize={30} fill="#90EE90">
                {/* {allocatedparkingslots.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))} */}
              </Bar>


            </BarChart>
          </ResponsiveContainer>
        </div>



        <div className={Styles.customGraph}>
          <div className={Styles.graphDownload}>
            <h4 >Comapany And Basement Wise In Building</h4>
            <button className={Styles.btn} onClick={() => downloadXcellReport('CompanybasementWise')}>
              {isLoadingthree ? (
                <FaSpinner className={Styles.animatespin} size={20} />
              ) : (
                <FaDownload />
              )}
            </button>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tenanatsAndbasements} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tenant_name" />
              <YAxis />
              <Tooltip />
               <Legend />
              {tenanatsAndbasements.length > 0 &&
                Array.from(
                  new Set(
                    tenanatsAndbasements.flatMap((item) =>
                      Object.keys(item).filter((key) => key !== "tenant_name")
                    )
                  )
                ).map((basement, index) => (
                  <Bar
                    key={basement}
                    dataKey={basement}
                    fill={getColor(index)}
                    barSize={30}
                  />
                ))}




            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={Styles.customGraph}>
          <div className={Styles.graphDownload}>
            <h4 >Basement And Company Wise In Building</h4>
            <button className={Styles.btn} onClick={() => downloadXcellReport('BasementcompanyWise')}>
              {isLoadingfour ? (
                <FaSpinner className={Styles.animatespin} size={20} />
              ) : (
                <FaDownload />
              )}
            </button>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={basementsAndTenantwise} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="BasementName" />
              <YAxis />
              <Tooltip />
               <Legend />
              {basementsAndTenantwise.length > 0 &&
                Array.from(
                  new Set(
                    basementsAndTenantwise.flatMap((item) =>
                      Object.keys(item).filter((key) => key !== "BasementName")
                    )
                  )
                ).map((basement, index) => (
                  <Bar
                    key={basement}
                    dataKey={basement}
                    fill={getColor(index)}
                    barSize={30}
                  />
                ))}




            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

const getColor = (index: number) => {
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff4560"];
  return colors[index % colors.length];
};

