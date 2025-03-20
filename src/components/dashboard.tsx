

// below is main working fine 


"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import dashboardstyle from "./dashboard.module.css"
import { AiOutlineEye } from "react-icons/ai";
import { FaEye, FaTimes } from "react-icons/fa";
import Loader from "./loader";
import { MdDownloadForOffline } from "react-icons/md";
import toast from 'react-hot-toast';

// Define TypeScript Interface for Parking Data
interface ParkingData {
  name: string;
  [key: string]: string | number; // Allows dynamic basement keys like "Basement1", "Basement2"
}
interface CompanyWiseParking {
  building_name: string;
  company_name: string;
  total_reserved_slots: number;
}
interface basementAndtebetwise {
  name: any;
  building_name: string;
  company_name: string;

}

interface comapanyBasementwise {
  name: any;
  building_name: string;
  basement_reserved_slots: number;

}

export default function ParkingStackedBarChart() {
  const [parkingData, setParkingData] = useState<ParkingData[]>([]);
  const [allocatedparkingData, setAllocatedParkingData] = useState<ParkingData[]>([]);
  const [comapanyWiseparkingData, setcomapanyWiseparkingData] = useState<CompanyWiseParking[]>([])
  const [basementAndtenantData, setbasementAndtenantData] = useState<basementAndtebetwise[]>([])
  const [companyAndbasementwise,setcompanyAndbasementwise]= useState<comapanyBasementwise []>([])
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileURL, setFileURL] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchParkingData() {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getbuidingdetails`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const { data, basement_and_tenats, buildings_and_tenants } = await response.json();
        console.log("---->> Raw API Data:", data);
        console.log("---->> Raw API basement_and_tenats:", basement_and_tenats);
        console.log("---->> Raw API buildings_and_tenants:", buildings_and_tenants);

        // Transform API Data into the required format
        const formattedData: ParkingData[] = Object.values(
          data.reduce((acc: { [key: string]: ParkingData }, { building_name, Basement_Name, no_of_slots }: any) => {
            if (!acc[building_name]) acc[building_name] = { name: building_name };
            acc[building_name][Basement_Name] = no_of_slots;
            return acc;
          }, {})
        );

        const parkingAllocatedData: ParkingData[] = Object.values(
          data.reduce(
            (acc: { [key: string]: ParkingData }, { building_name, Basement_Name, allocated_slots }: any) => {
              if (!acc[building_name]) acc[building_name] = { name: building_name };
              acc[building_name][Basement_Name] = allocated_slots;
              return acc;
            },
            {}
          )
        );

        if (buildings_and_tenants) {
          const buildingsAndTenantsData: CompanyWiseParking[] = Object.values(
            buildings_and_tenants.reduce(
              (acc: { [key: string]: any }, { building_name, tenant_name, total_reserved_slots }: any) => {
                if (!acc[building_name]) acc[building_name] = { name: building_name };
                acc[building_name][tenant_name] = total_reserved_slots;
                return acc;
              },
              {}
            )
          );
          setcomapanyWiseparkingData(buildingsAndTenantsData)
          console.log("formated data for buildingsAndTenantsData", buildingsAndTenantsData);
        }

        // const formatdataForcompany_and_basement : comapanyBasementwise [] = Object.values(
        //   basement_and_tenats.reduce((acc: { [key: string]: any }, { tenant_name, Basement_Name, basement_reserved_slots }: any)=>{

        //   })
        // );

        const formatDataForCompanyAndBasement : comapanyBasementwise [] = Object.values(
          basement_and_tenats.reduce((acc: { [key: string]: any }, item: any) => {
            const { TenantID, tenant_name, BasementID, Basement_Name, basement_reserved_slots, building_name } = item;
            console.log(`Iteration : Processing`, item);
        
            if (!tenant_name) return acc; // Skip if no tenant name
            console.log("Before updating acc:", JSON.stringify(acc, null, 2));
        
            // Create company entry if not exists
            if (!acc[tenant_name]) {
              acc[tenant_name] = { name: tenant_name, building: building_name };

              console.log(`Created new entry for ${tenant_name}:`, acc[tenant_name]);
            }
        
            // Assign basement slot counts dynamically
            if (BasementID && Basement_Name) {
              acc[tenant_name][Basement_Name] = (acc[tenant_name][Basement_Name] || 0) + basement_reserved_slots;
              console.log(`Updated ${tenant_name}'s ${Basement_Name}:`, acc[tenant_name]);
            }
            console.log("After updating acc:", JSON.stringify(acc, null, 2), "\n");
            return acc;
          }, {})
        );
        
        console.log('formatDataForCompanyAndBasement',formatDataForCompanyAndBasement);

        setcompanyAndbasementwise(formatDataForCompanyAndBasement)
        

        // Step 1: Convert API Data into Required Format
        const formattedDataforabasemnt_tenant: basementAndtebetwise[] = basement_and_tenats.reduce((acc: any[], curr: { building_name: any; Basement_Name: any; tenant_name: string | number; basement_reserved_slots: any; }) => {
          const key = `${curr.building_name} - ${curr.Basement_Name}`;

          // Find existing entry or create a new one
          let existingEntry = acc.find((entry: { name: string; }) => entry.name === key);
          if (!existingEntry) {
            existingEntry = { name: key };
            acc.push(existingEntry);
          }

          // Add the tenant's reserved slots under their name
          existingEntry[curr.tenant_name] = (existingEntry[curr.tenant_name] || 0) + curr.basement_reserved_slots;

          return acc;
        }, []);

        console.log(formattedDataforabasemnt_tenant);
        const cleanedData = formattedDataforabasemnt_tenant.filter(entry => !entry.name.includes('null') && !Object.keys(entry).includes('null'));
        console.log('cleanedData', cleanedData)
        setbasementAndtenantData(cleanedData)




        console.log("---->> Allocated Parking Data:", parkingAllocatedData);
        console.log("---->> Transformed Data:", formattedData);

        setParkingData(formattedData);
        setAllocatedParkingData(parkingAllocatedData);
      } catch (err) {
        console.error("Error fetching parking data:", err);
      }
      setLoading(false);
    }

    fetchParkingData();
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      console.log('--->>event.target.files[0]', event.target.files[0])
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(event.target.files[0].name);
      setFileURL(URL.createObjectURL(selectedFile));
    }
  }

  const clearImage = () => {
    setFileURL("");
    setShowPreview(false); // Close preview if open
    setFileName("")
  };

 
  const download = async (Type: string) => {
    console.log('------>> Type:', Type);
  
    try {
      // Fetch the Excel file from the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/downloadparkingslotsReport?Type=${encodeURIComponent(Type)}`
      );
  
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      let filename = "Parking_slots.xlsx";
      const contentDisposition = response.headers.get("Content-Disposition");
      console.log('---->>contentDisposition', contentDisposition)
      if (contentDisposition) {
        console.log('---->> in side if contentDisposition', contentDisposition)
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
      

      console.log('---->>filename', filename)
      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Name of the downloaded file
      document.body.appendChild(link);
      link.click();
  
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download successful!');
  
      console.log("Download successful!");
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  

  return (

    <div >
       {loading && <Loader  />}

      {/* <div className={dashboardstyle.uploadcontainer}>
        <label   className={dashboardstyle.customfileupload}>
          <input type="file" onChange={handleFileChange}  className={dashboardstyle.customfileuploadinput}/>
          {fileName ? fileName : "Select File"}
        </label>

        {fileURL && (
          <>
            <button onClick={() => setShowPreview(true)} className={dashboardstyle.filebutton}>
              <FaEye size={24} color="#007bff" />
            </button>

            <button onClick={clearImage} className={dashboardstyle.filebutton} >
              <FaTimes size={24} color="red" />
            </button>
          </>
        )}

        {showPreview && (
          <div className={dashboardstyle.preview}>
            <p className={dashboardstyle.previewHeading}>{fileName}</p>
            <img src={fileURL} alt="Preview" className={dashboardstyle.previewImage} />
            <button onClick={() => setShowPreview(false)} className={dashboardstyle.previewClosebutton}>
              Close
            </button>
          </div>
        )}
        <button className={dashboardstyle.fileUploadsubmit}>
          Submit
        </button>
      </div> */}



      <div className={dashboardstyle.custommisingchartsContainer}>
        <div className={dashboardstyle.customGraphs}>
          <h3 className={dashboardstyle.chartTitle}>Total Parking Slots</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={parkingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              {parkingData.length > 0 &&
                Object.keys(parkingData[0])
                  .filter((key) => key !== "name")
                  .map((basement, index) => (
                    <Bar key={`${basement}-${index}`} dataKey={basement} stackId="a" fill={getColor(index)} />
                  ))}

            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={dashboardstyle.customGraphs}>
          <h3 className={dashboardstyle.chartTitle}>Allocated Parking Slots</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={allocatedparkingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />


              {allocatedparkingData.length > 0 &&
                Object.keys(allocatedparkingData[0])
                  .filter((key) => key !== "name")
                  .map((basement, index) => (
                    <Bar key={`${basement}-${index}`} dataKey={basement} stackId="a" fill={getColor(index)} />
                  ))}

            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={dashboardstyle.customGraphs}>
          <div className={dashboardstyle.downloadflex}>
          <h3 className={dashboardstyle.chartTitle}>Building-Tenant-wise Reserved Parking Slots</h3>
          <button className={dashboardstyle.downloadbutton} onClick={() => download("BuildingandTenant")} ><MdDownloadForOffline size="1.7rem"/></button>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={comapanyWiseparkingData} barSize={35} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />



              {comapanyWiseparkingData.length > 0 &&
                Array.from(
                  new Set(comapanyWiseparkingData.flatMap((building) => Object.keys(building).filter((key) => key !== "name")))
                ).map((company, index) => (
                  <Bar key={company} dataKey={company} stackId="a" fill={getColor(index)} />
                ))}


            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={dashboardstyle.customGraphs}>
          <h3 className={dashboardstyle.chartTitle}>Company-wise Reserved Parking Slots per Basement</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={basementAndtenantData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0} 
                angle={-45} 
                textAnchor="end"
              />
              <YAxis />
              <Tooltip />
              <Legend />

              {basementAndtenantData.length > 0 &&
                Array.from(
                  new Set(basementAndtenantData.flatMap((building) => Object.keys(building).filter((key) => key !== "name")))
                ).map((company, index) => (
                  <Bar key={company} dataKey={company} stackId="a" fill={getColor(index)} />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={dashboardstyle.customGraphs}>
          <div className={dashboardstyle.downloadflex}>
          <h3 className={dashboardstyle.chartTitle}>Basement-Tenant-wise Reserved Parking Slots</h3>
          <button className={dashboardstyle.downloadbutton} onClick={() => download("Basementwise")} ><MdDownloadForOffline size="1.7rem"/></button>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={companyAndbasementwise} barSize={35} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              {companyAndbasementwise.length > 0 &&
                Array.from(
                  new Set(companyAndbasementwise.flatMap((building) =>
                    Object.keys(building).filter((key) => key !== "name" && key !== "building")
                  ))
                ).map((company, index, arr) => (
                  <Bar key={company} dataKey={company} stackId="a" fill={getColor(index)}>
                    {index === arr.length - 1 && (
                      <LabelList
                        dataKey="building"
                        position="top"
                        fill="black"
                        fontSize={12}
                        fontWeight="bold"
                      />
                    )}
                  </Bar>
                ))
              }
            </BarChart>

          </ResponsiveContainer>
        </div>
        
      </div>

    </div>

  );
}

// Function to assign colors dynamically
const getColor = (index: number) => {
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff6f61", "#ffb400", "#8d44ad"];
  return colors[index % colors.length];
};
