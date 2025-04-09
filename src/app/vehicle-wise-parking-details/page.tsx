
"use client"
import React, { useEffect, useState } from 'react'
import Styles from './vehicleWise.module.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell, } from "recharts";

interface vechiclesdata {
  two_wheeler: number;
  four_wheeler: number;
}

export default function vehicleWise() {
  const [totalvehicledata, settotalvehicledata] = useState<vechiclesdata[]>([])
 
  useEffect(() => {

    getvehicleWiseparkingdata();
  }, []);

  const getvehicleWiseparkingdata = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getvehiclewiseparkingdata`);
    if (!response.ok) throw new Error("Failed to fetch data");

    const { vehiclewiseData } = await response.json();
    console.log('---->>single vehiclewiseData data ', vehiclewiseData)
    const formatingvehicledata = vehiclewiseData.map((item: any) => ({

      two_wheeler: item.total_two_wheeler_slots,
      four_wheeler: item.total_four_wheeler_slots
    }))
    console.log('--->>formatingvehicledata', formatingvehicledata)
    settotalvehicledata(formatingvehicledata)

  }
  return (
    <div className={Styles.vechicleComtainer}>
      <div>
        <h3>Parking Details Vehicle Wise</h3>
      </div>

      <div className='graph-container'>
        <div>
          <div className={Styles.graphHeading}>
            <p> Total Vehicles in N-Heights Buiding</p>
          </div>
          <div>
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

          <div className={Styles.graphHeading}>
            <p> Total Vehicles in N-Heights Buiding</p>
          </div>
          <div>
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
        </div>

      </div>

    </div>
  )
}
