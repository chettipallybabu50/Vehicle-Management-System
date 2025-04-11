import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try{
        const [results] = await pool.query(`
       
            SELECT BuildingID, name as building_name,total_slots as total_parking_capacity_building, total_four_wheeler_slots,
            total_two_wheeler_slots from building_details;   
            `);
        
      
        const [basementwisevehicledata] = await pool.query(`
                SELECT  b.name AS building_name, bs.BasementID, bs.Basement_Name, bs.No_of_Slots, bs.four_wheeler_slots, 
                bs.two_heeler_slots, bs.two_heeler_slots - bs.Two_Wheeler_Available AS Two_wheeler_allocated,
                bs.four_wheeler_slots - bs.Four_Wheeler_Available AS Four_wheeler_allocated
                 FROM building_details AS b  LEFT JOIN basement_details AS bs ON b.BuildingID = bs.BuildingID
                 ORDER BY bs.Basement_Name ASC
              `);
        
              
        if (Array.isArray(results) && results.length > 0){
            return NextResponse.json({
                success: true,
                message: 'data fetched successfully',
                vehiclewiseData: results,
                basementwisevehicledata:basementwisevehicledata

            },{status:200})
        }
        else{
            return NextResponse.json({
                success: false,
                message:'No Data Found',
                vehiclewiseData:[]
            },{status:204})
        }

    }
    catch(error){
        console.log('---->>> error',  error)
        return NextResponse.json({
            message: "something went wrong please check",
        },{status:500})
    }
}
