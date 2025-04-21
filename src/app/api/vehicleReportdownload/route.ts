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

            const [results] = await pool.query(`SELECT  b.name AS building_name, bs.Basement_Name, bs.No_of_Slots AS Total_slots, 
                                        bs.four_wheeler_slots AS Total_four_wheeler, bs.two_heeler_slots AS Total_two_wheelers FROM  building_details AS b 
                                        LEFT JOIN  basement_details AS bs ON b.BuildingID = bs.BuildingID`);

            const total_two_four_wheelers = results as any[];
            const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
            total_two_four_wheelers.sort((a, b) => collator.compare(a.Basement_Name, b.Basement_Name));


            // Create a new Excel workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Total_TwoFour_Wheeler_vehicles");
            //define header row 
            worksheet.columns = [
                { header: "S.No", key: "serial_number", width: 5 },
                { header: "Basement Name", key: "Basement_Name", width: 25 },
                { header: "Total Basement Capacity", key: "No_of_Slots", width: 20 },
                { header: "Total Four Wheeler", key: "four_wheeler_slots", width: 20 },
                { header: "Total Two Wheeler", key: "two_wheeler_slots", width: 20 },
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

            // Process and add data rows
            let serialNumber = 1;
            let total_basement_capcity = 0;
            let total_four_wheelers = 0;
            let total_two_wheelers = 0;
            total_two_four_wheelers.forEach((row) => {
                worksheet.addRow({
                    Basement_Name: row.Basement_Name,
                    No_of_Slots: row.Total_slots || 0,
                    four_wheeler_slots: row.Total_four_wheeler || 0,
                    two_wheeler_slots: row.Total_two_wheelers || 0,
                    serial_number: serialNumber++
                });
                total_basement_capcity = total_basement_capcity + row.Total_slots
                total_four_wheelers = total_four_wheelers + row.Total_four_wheeler
                total_two_wheelers = total_two_wheelers + row.Total_two_wheelers
            });
            console.log('--->>total_basement_capcity', total_basement_capcity)
            console.log('--->>total_four_wheelers', total_four_wheelers)
            console.log('--->>total_two_wheelers', total_two_wheelers)
            if (total_two_four_wheelers.length > 0) {
                worksheet.addRow({
                    serial_number: "",
                    Basement_Name: "Total", // Correct key
                    No_of_Slots: total_basement_capcity,
                    four_wheeler_slots: total_four_wheelers,
                    two_wheeler_slots: total_two_wheelers

                }).font = { bold: true };
            }

            const lastRow = worksheet.lastRow; // Get the last row
            console.log('lastRow', lastRow)
            if (lastRow) {
                lastRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "D9D9D9" }, // Light gray
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
                    "Content-Disposition": "attachment; filename=Total_Two_Four_Wheeler_Report.xlsx",
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            });
        }
        if(Type == 'VAllocated'){

            const [allocatedvehicleResult] = await pool.query(`
                SELECT 
                  b.name AS Building_name, 
                  bs.Basement_Name,
                  bs.No_of_Slots AS Total_capacity,
                  bs.Allocated_Slots AS reserved_slots,
                  bs.four_wheeler_slots - bs.Four_Wheeler_Available AS four_wheeler_reserved_slots,
                  bs.two_heeler_slots - bs.Two_Wheeler_Available AS two_wheeler_reserved,
                  bs.four_wheeler_slots AS total_capacity_of_four_wheeler,
                  bs.two_heeler_slots AS total_capacity_of_two_wheeler
                FROM 
                  building_details AS b
                LEFT JOIN 
                  basement_details AS bs 
                ON 
                  b.BuildingID = bs.BuildingID
              `);

              const vehiclesReservedData = allocatedvehicleResult as any[];
              const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
              vehiclesReservedData.sort((a, b) => collator.compare(a.Basement_Name, b.Basement_Name));

                 // Create a new Excel workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Reserved_TwoFour_Wheeler_vehicles");

              //define header row 
              worksheet.columns = [
                { header: "S.No", key: "serial_number", width: 5 },
                { header: "Basement Name", key: "Basement_Name", width: 25 },
                { header: "Total Basement Capacity", key: "No_of_Slots", width: 20 },
                { header: "Total Resevrved Vehicles", key: "total_reserverd_vehicles", width: 20 },
                { header: "Four Wheeler Capacity", key: "four_wheeler_capacity", width: 20 },
                { header: "4 Wheeler Reserved", key: "four_wheeler_reserved", width: 20 },
                { header: "Two Wheeler Capacity", key: "two_wheeler_capacity", width: 20 },
                { header: "2 Wheeler Reserved", key: "two_wheeler_reserved", width: 20 },
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

            let serialNumber = 1;
            let total_basement_capcity = 0;
            let total_four_wheelers = 0;
            let total_two_wheelers = 0;
            let total_four_wheeler_reserved =0;
            let total_two_wheeler_reserve =0;
            let total_vehicles_reserve =0;

            vehiclesReservedData.forEach((row)=>{
                worksheet.addRow({
                    serial_number: serialNumber++,
                    Basement_Name:row.Basement_Name,
                    No_of_Slots: row.Total_capacity || 0,
                    total_reserverd_vehicles: row.reserved_slots || 0,
                    four_wheeler_capacity : row.total_capacity_of_four_wheeler || 0,
                    four_wheeler_reserved : row.four_wheeler_reserved_slots || 0,
                    two_wheeler_capacity : row.total_capacity_of_two_wheeler || 0,
                    two_wheeler_reserved : row.two_wheeler_reserved || 0

                })
                total_basement_capcity = total_basement_capcity + row.Total_capacity
                total_vehicles_reserve = total_vehicles_reserve + row.reserved_slots
                total_four_wheelers = total_four_wheelers + row.total_capacity_of_four_wheeler
                total_two_wheelers = total_two_wheelers + row.total_capacity_of_two_wheeler
                total_four_wheeler_reserved = total_four_wheeler_reserved + row.four_wheeler_reserved_slots
                total_two_wheeler_reserve = total_two_wheeler_reserve + row.two_wheeler_reserved
            })
            if(vehiclesReservedData.length >0){
                worksheet.addRow({
                    serial_number: "",
                    Basement_Name: "Total", // Correct key
                    No_of_Slots: total_basement_capcity,
                    total_reserverd_vehicles: total_vehicles_reserve,
                    four_wheeler_capacity: total_four_wheelers,
                    four_wheeler_reserved : total_four_wheeler_reserved,
                    two_wheeler_capacity: total_two_wheelers,
                    two_wheeler_reserved: total_two_wheeler_reserve

                }).font = { bold: true };
            }
            const lastRow = worksheet.lastRow; // Get the last row
            console.log('lastRow', lastRow)
            if (lastRow) {
                lastRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "D9D9D9" }, // gray
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
                    "Content-Disposition": "attachment; filename=Reserved_Two_Four_Wheeler_Report.xlsx",
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            });
   
        }

    }
    catch (error) {
        console.log('--->>>error', error)
        return NextResponse.json(
            { error: "Failed to generate Excel" },
            { status: 500 }
        );
    }

}