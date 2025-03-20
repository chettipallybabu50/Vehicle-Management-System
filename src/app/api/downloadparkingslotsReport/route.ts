
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const Type = searchParams.get("Type");
    console.log('--->>Type', Type)

    if (Type == 'Basementwise') {


      // Run SQL query and get the result set
      const [results] = await pool.query(`
      SELECT 
        tb.name AS tenant_name,
        b.name AS building_name,
        tb.Basement_Name,
        tb.basement_reserved_slots
      FROM building_details b
      LEFT JOIN tenant_basement_details tb ON b.BuildingID = tb.BuildingID;
    `);

      // Cast the result as an array of any to avoid TypeScript error
      const basementAndtenants = results as any[];

      // Create a new Excel workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("TenantandBasementWise");

      // Define header row
      worksheet.columns = [
        { header: "Tenant Name", key: "tenant_name", width: 25 },
        { header: "Building Name", key: "building_name", width: 25 },
        { header: "Basement Name", key: "Basement_Name", width: 25 },
        { header: "Reserved Slots", key: "basement_reserved_slots", width: 20 },
      ];

      // Process and add data rows
      basementAndtenants.forEach((row) => {
        worksheet.addRow({
          tenant_name: row.tenant_name,
          building_name: row.building_name,
          Basement_Name: row.Basement_Name,
          basement_reserved_slots: row.basement_reserved_slots || 0,
        });
      });

      // Create buffer to store file
      const buffer = await workbook.xlsx.writeBuffer();

      // Return Excel file as a response
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Disposition": "attachment; filename=Tenant_and_Basement_wise.xlsx",
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    }

    if(Type=='BuildingandTenant'){
      console.log('---->>  BuildingandTenant  --type')

      const [results] = await pool.query(`
         SELECT 
                        b.BuildingID, 
                        b.name AS building_name, 
                        tb.TenantID, 
                        tb.name AS tenant_name, 
                        tb.total_reserved_slots
                    FROM building_details b
                    LEFT JOIN tenant_buildings tb ON b.BuildingID = tb.BuildingID;
      
      `);

      const building_And_tenants = results as any[];

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("BuidingAndTenantWise");

      worksheet.columns = [
        { header: "Building Name", key: "building_name", width: 25 },
        { header: "Tenant Name", key: "tenant_name", width: 25 },
        { header: "Reserved Slots", key: "total_reserved_slots", width: 20 },
      ];

      building_And_tenants.forEach((row) => {
        worksheet.addRow({
          building_name: row.building_name,
          tenant_name: row.tenant_name,
          total_reserved_slots: row.total_reserved_slots || 0,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Disposition": "attachment; filename=Building_and_Tenant_wise.xlsx",
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

    }
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel" },
      { status: 500 }
    );
  }
}
