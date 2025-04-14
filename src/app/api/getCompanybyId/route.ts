import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        console.log('---->> req method', req.method)
        console.log('---->> req url', req.url)
        const { searchParams } = new URL(req.url);
        const TenantID = searchParams.get("TenantID");
        console.log('--->>TenantID', TenantID)
        if (TenantID) {
            const [results] = await pool.query(
                `SELECT  Basement_Name, BasementID, four_wheeler_slots_reserved, two_wheeler_slots_reserved,
             basement_reserved_slots FROM tenant_basement_details 
             WHERE TenantID = ?`,
                [TenantID]
            );

            if (Array.isArray(results) && results.length > 0) {
                return NextResponse.json({
                    message: "data fetched successfully",
                    databyId: results,
                }, { status: 200 })
            } else {
                return NextResponse.json({
                    message: "No Data Found",
                    databyId: []
                }, { status: 204 })
            }

        }

    } catch (error) {
        return NextResponse.json({
            message: "something went wrong please check"
        }, { status: 500 })

    }

}