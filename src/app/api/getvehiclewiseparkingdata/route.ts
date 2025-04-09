import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try{
        const [results] = await pool.query(`
       
            SELECT BuildingID, name as building_name,total_slots as total_parking_capacity_building, total_four_wheeler_slots,
            total_two_wheeler_slots from building_details;   
            `);
        if (Array.isArray(results) && results.length > 0){
            return NextResponse.json({
                success: true,
                message: 'data fetched successfully',
                vehiclewiseData: results

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
