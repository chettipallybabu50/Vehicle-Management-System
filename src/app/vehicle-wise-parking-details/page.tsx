
"use client"
import React, { useEffect, useState } from 'react'
import Styles from './vehicleWise.module.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell, Rectangle, } from "recharts";

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

export default function vehicleWise() {
  const [totalvehicledata, settotalvehicledata] = useState<vechiclesdata[]>([])
  const [totalbasementvehicedata, settotalbasementvehicedata]=useState<basementwisevehicledata[]>([])
  const [allocatedvehiclesData, setallocatedvehiclesData] = useState<vehiclsallocatedData[]>([])
 
  useEffect(() => {

    getvehicleWiseparkingdata();
  }, []);

  const getvehicleWiseparkingdata = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getvehiclewiseparkingdata`);
    if (!response.ok) throw new Error("Failed to fetch data");

    const { vehiclewiseData, basementwisevehicledata } = await response.json();
    console.log('---->>single vehiclewiseData data ', vehiclewiseData)
    console.log('---->>single basementwisevehicledata data ', basementwisevehicledata)
    const formatingvehicledata = vehiclewiseData.map((item: any) => ({

      two_wheeler: item.total_two_wheeler_slots,
      four_wheeler: item.total_four_wheeler_slots
    }))
    console.log('--->>formatingvehicledata', formatingvehicledata)
    settotalvehicledata(formatingvehicledata)

    const formatbasementvehicledata=  basementwisevehicledata.map((item:any)=>({
      basement_name:item.Basement_Name,
      two_wheeler: item.two_heeler_slots,
      four_wheeler: item.four_wheeler_slots
    }))
    console.log('---->>formatbasementvehicledata', formatbasementvehicledata)
    settotalbasementvehicedata(formatbasementvehicledata)

    const formatvehicledata = basementwisevehicledata.map((item:any)=>({
      basement_name:item.Basement_Name,
      two_wheeler: item.Two_wheeler_allocated,
      four_wheeler: item.Four_wheeler_allocated
    }))
    console.log('---->>formatvehicledata', formatvehicledata)
    setallocatedvehiclesData(formatvehicledata)

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
  
  return (
    <div className={Styles.vechicleComtainer}>
      <div>
        <h3>Parking Details Vehicle Wise</h3>
      </div>

      <div>
        <div className={Styles.graphcontainer}>
       
          
          <div className={Styles.graphsstyles}>
               
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
                {/* <Bar dataKey="4-Wheeler" fill="#82ca9d" /> */}
              </BarChart>
            </ResponsiveContainer>

          </div>

          
            
          
          <div className={Styles.graphsstyles}>
               
          <p className={Styles.graphHeading}> Total Vehicles in a Basement</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={totalbasementvehicedata}  >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="basement_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="two_wheeler" fill="#F8766D" activeBar={<Rectangle fill="pink" stroke="blue" />} barSize={30} />
                <Bar dataKey="four_wheeler" fill="#7CAE00" activeBar={<Rectangle fill="gold" stroke="purple" />} barSize={30} />
                {/* <Bar dataKey="4-Wheeler" fill="#82ca9d" /> */}
              </BarChart>
            </ResponsiveContainer>

          </div>

          <div className={Styles.graphsstyles}>
               
               <p className={Styles.graphHeading}> Allocated Vehicles in a Basement</p>
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={allocatedvehiclesData}  >
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="basement_name" />
                     <YAxis />
                     <Tooltip content={<CustomTooltip />}/>
                     <Legend />
                     <Bar dataKey="two_wheeler" fill="#F8766D" activeBar={<Rectangle fill="pink" stroke="blue" />} barSize={30} />
                     <Bar dataKey="four_wheeler" fill="#7CAE00" activeBar={<Rectangle fill="gold" stroke="purple" />} barSize={30} />
                     {/* <Bar dataKey="4-Wheeler" fill="#82ca9d" /> */}
                   </BarChart>
                 </ResponsiveContainer>
     
               </div>

          <div className={Styles.graphsstyles}>
            <div className={Styles.headingandselectcontainer}>

              <p className={Styles.graphHeading}> Basement- Comapnyeise vehicle Parking</p>
              <select name="cars" id="cars" className={Styles.basementSelection}>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="B3">B3</option>
                <option value="B4">B4</option>
              </select>
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
                {/* <Bar dataKey="4-Wheeler" fill="#82ca9d" /> */}
              </BarChart>
            </ResponsiveContainer>

          </div>
          
        </div>

      </div>

    </div>
  )
}
