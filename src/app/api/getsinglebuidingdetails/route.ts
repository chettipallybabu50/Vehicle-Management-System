import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try{
        console.log('---->>>signle building details  request coming ')


        const [results] = await pool.query(`
       
            SELECT  b.BuildingID, b.name AS building_name, b.address, b.total_slots, b.no_of_basements,
             bs.BasementID, bs.Basement_Name, bs.no_of_slots, bs.allocated_slots FROM building_details b
            LEFT JOIN basement_details bs ON b.BuildingID = bs.BuildingID;

            `);

        const [basementAndtenats]= await pool.query(`SELECT b.BuildingID,b.name AS building_name, tb.BasementID,tb.Basement_Name, 
                tb.TenantID, tb.name AS tenant_name, tb.basement_reserved_slots FROM building_details b
                LEFT JOIN tenant_basement_details tb ON b.BuildingID = tb.BuildingID;
              `)
        console.log('------->> Buildings , basement with tenants and reserved slots', basementAndtenats);
            if (Array.isArray(results) && results.length > 0) {
                return NextResponse.json({
                    success: true,
                    message: "Data fetched successfully",
                    data: results,
                    basement_and_tenats: basementAndtenats
                },
                    { status: 200 });
    
            }
            else {
                return NextResponse.json({
                    success: false,
                    message: "No data found",
                    data: [],
                    basement_and_tenats: []
                }, { status: 204 })
            }

    }
    catch(error){
        console.log('---->>single building ',error)
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong. Please try again later",
            },
            { status: 500 }
        )

    }

}