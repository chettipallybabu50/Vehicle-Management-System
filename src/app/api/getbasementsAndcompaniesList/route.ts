import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {

        const [results] = await pool.query(`SELECT BasementID, Basement_Name FROM basement_details`);

        const [companies]= await pool.query(`SELECT TenantID, tenant_name FROM tenants`);


        if(Array.isArray(results) && results.length > 0){
            return NextResponse.json({
                message:"successfully basements data fetched",
                basementdata: results,
                companiesList:  companies
            },{status:200})
        }else{
            return NextResponse.json({
                message:"No data found",
                basementdata:[],
                companiesList: []
            },{status:204})
        }
    }
    catch(error){
        return NextResponse.json({
            message:"something went wrong please check"
        },{status:500})

    }
}