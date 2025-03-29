import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
    try {
        console.log('---->> req method', req.method)
        console.log('---->> req url', req.url)
        const { searchParams } = new URL(req.url);
        const Type = searchParams.get("Type");
        console.log('--->>Type', Type)

        if (Type == 'Total') {
            const [result] = await pool.query(`
            SELECT b.name AS BuildingName, b.total_slots AS total_capacity, b.no_of_basements AS total_basements,
            bs.Basement_Name, bs.No_of_Slots AS basement_capacity FROM  building_details b LEFT JOIN  basement_details bs ON  b.BuildingID = bs.BuildingID;`)

            const Single_building_data = result as any[];
            Single_building_data.sort((a, b) => a.Basement_Name.localeCompare(b.Basement_Name));
            //Creating Xcell
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("SingleBuildingReport");
            //Defining the xcell Headers
            worksheet.columns = [
                { header: "Basement Name", key: "Basement_Name", width: 25 },
                { header: "Basement Capacity", key: "Total_capcity_of_basement", width: 20 },
            ];


            // adding the colors to headers
            const headerRow = worksheet.getRow(1);
            console.log('----->>>headerRow', headerRow)
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFCC00" }, // Yellow
                };
                cell.font = { bold: true, color: { argb: "000000" } }; // Bold and black
            });

            // Process and add data rows
            Single_building_data.forEach((row) => {
                worksheet.addRow({
                    Basement_Name: row.Basement_Name,
                    Total_capcity_of_basement: row.basement_capacity || 0,
                });
            });


            //  Add Total Row at the end
            if (Single_building_data.length > 0) {
                const totalCapacity = Single_building_data[0].total_capacity || 0; // Get total from DB
                worksheet.addRow({
                    Basement_Name: "Total", // Correct key
                    Total_capcity_of_basement: totalCapacity,

                }).font = { bold: true }; // Make total row bold
            }
            const lastRow = worksheet.lastRow; // Get the last row
            if (lastRow) {
                lastRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFFF00" }, // Light Yellow for Total Row
                    };
                    cell.font = { bold: true, color: { argb: "FF0000" } }; // Bold and Red text
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },


                        //--------->>  the below one  and above one for adding the borders to the cells <<--------//

                        // top: { style: "medium" }, // Medium line at top
                        // left: { style: "dashed" }, // Dashed line on left
                        // bottom: { style: "thick" }, // Thick line at bottom
                        // right: { style: "double" },
                    };
                });
            }
            const buffer = await workbook.xlsx.writeBuffer();

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    "Content-Disposition": "attachment; filename=Single_Building_Report.xlsx",
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            });

        }

       if (Type == 'Allocated'){
         const [allocatedResult]= await pool.query(`select  b.name AS BuildingName,b.total_slots AS building_total_capacity,bs.Basement_Name,
            bs.Allocated_Slots, bs.No_of_Slots AS basement_capacity FROM  building_details b LEFT JOIN  basement_details bs ON  b.BuildingID = bs.BuildingID;`)

            const basementwiseallocation = allocatedResult as any[];
            // Sort data alphabetically by Basement_Name
            basementwiseallocation.sort((a, b) => a.Basement_Name.localeCompare(b.Basement_Name));

            console.log('---->>>basementwiseallocation', basementwiseallocation)
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("ParkingslotsAllocatedReport");

            worksheet.columns = [
                { header: "Basement Name", key: "Basement_Name", width: 25 },
                { header: "Basement Capacity", key: "Total_capcity_of_basement", width: 20 },
                { header: "Allocated Parking Slots", key: "allocated_parking_slots", width: 20 },
                { header: "Available Parking Slots", key: "available_parking_slots", width: 20 },
            ];

            const headerRow = worksheet.getRow(1);
            console.log('----->>>headerRow', headerRow)
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFCC00" }, // Yellow
                };
                cell.font = { bold: true, color: { argb: "000000" } }; // Bold and black
            });

            let totalAllocated = 0;
            let totalAvailable = 0;
            basementwiseallocation.forEach((row) => {

                const allocatedSlots = row.Allocated_Slots || 0;
                const availableSlots =
                  row.basement_capacity !== null && row.Allocated_Slots !== null
                    ? row.basement_capacity - row.Allocated_Slots
                    : 0;

                worksheet.addRow({
                    Basement_Name: row.Basement_Name,
                    Total_capcity_of_basement: row.basement_capacity || 0,
                    allocated_parking_slots: allocatedSlots,
                    available_parking_slots : availableSlots
                });

                totalAllocated += allocatedSlots;
                totalAvailable += availableSlots;
   
            });

            if (basementwiseallocation.length > 0) {
                const totalCapacity = basementwiseallocation[0].building_total_capacity || 0; // Get total from DB
                worksheet.addRow({
                    Basement_Name: "Total", // Correct key
                    Total_capcity_of_basement: totalCapacity,
                    allocated_parking_slots: totalAllocated, // Total allocated
                    available_parking_slots: totalAvailable, // Total available

                }).font = { bold: true }; // Make total row bold
            }

            const lastRow = worksheet.lastRow; // Get the last row
            if (lastRow) {
                lastRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "90EE90" }, // Light Yellow for Total Row
                    };
                    cell.font = { bold: true, color: { argb: "FF0000" } }; // Bold and Red text
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });
            }

            const buffer = await workbook.xlsx.writeBuffer();

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    "Content-Disposition": "attachment; filename=Allocated_Parking_Slot_details.xlsx",
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            });
       }

        if (Type == 'CompanybasementWise') {

            const [companyandbasementwiseresult] = await pool.query(`SELECT name as Company_name, Basement_Name, basement_reserved_slots FROM tenant_basement_details; `);

            const companybasementwise = companyandbasementwiseresult as any[];

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("CompanyandBasementwise");

            worksheet.columns = [
                { header: "S.No", key: "serial_number", width: 10 },
                { header: "Company Name", key: "company_name", width: 20 },
                { header: "Basement Name", key: "Basement_Name", width: 25 },
                { header: "Allocated Parking Slots", key: "allocated_parking_slots", width: 20 },
            ];

            const headerRow = worksheet.getRow(1);
            console.log('----->>>headerRow', headerRow)
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFCC00" }, // Yellow
                };
                cell.font = { bold: true, color: { argb: "000000" } }; // Bold and black
            });

            let currentCompany = "";
            let serialNumber = 1;
            companybasementwise.forEach((row) => {
                // If company name changes, add a new row for the company
                if (row.Company_name !== currentCompany) {

                    worksheet.addRow({
                        serial_number: serialNumber,
                        company_name: row.Company_name,
                        Basement_Name: "", // Empty for company row
                        allocated_parking_slots: "",
                      });
                      currentCompany = row.Company_name;
                      serialNumber++; // Increment serial number
                    // worksheet.addRow([row.Company_name, "", ""]); // Add company name row
                    // currentCompany = row.Company_name;
                }

                worksheet.addRow({
                    serial_number: "", // No serial number for sub-rows
                    company_name: "",
                    Basement_Name: row.Basement_Name,
                    allocated_parking_slots: row.basement_reserved_slots,
                  });
                // Add basement and reserved slots row under the company
                // worksheet.addRow(["", row.Basement_Name, row.basement_reserved_slots]);
            });

            //  Generate Excel Buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Return as Excel File
            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    "Content-Disposition": "attachment; filename=Company_Basement_Wise.xlsx",
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            });
           
        }
    }
    catch (error) {
        return NextResponse.json(
            { error: "Failed to generate Excel" },
            { status: 500 }
          );

    }
}