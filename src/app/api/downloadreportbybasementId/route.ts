import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
    try {
        console.log('---->> req method', req.method)
        console.log('---->> req url', req.url)
        const { searchParams } = new URL(req.url);
        const BasementId = searchParams.get("BasementId");
        console.log('BasementId', BasementId)
        if (BasementId) {
            const [results] = await pool.query(
                `SELECT name AS Company_name,Basement_Name, TenantID, four_wheeler_slots_reserved, two_wheeler_slots_reserved,
             basement_reserved_slots FROM tenant_basement_details 
             WHERE BasementID = ?`,
                [BasementId]
            );

            const basementwisevehicledata = results as any[];
            // Create a new Excel workbook and worksheet
            const basementName = basementwisevehicledata[0].Basement_Name;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(`${basementName}-Basement`);

            //define header row 
            worksheet.columns = [
                { header: "S.No", key: "serial_number", width: 5 },
                { header: "Company Name", key: "company_Name", width: 25 },
                { header: "Company Reserved Slots", key: "company_reserved_slots", width: 20 },
                { header: "4 Wheeler Reserved", key: "four_reserved_slots", width: 20 },
                { header: "2 Wheeler Reserved", key: "two_reserved_slots", width: 20 },
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
            let total_baement_reserved = 0;
            let total_four_wheeler_reserved = 0;
            let total_two_wheeler_reserved = 0;
            basementwisevehicledata.forEach((row) => {
                worksheet.addRow({
                    serial_number: serialNumber++,
                    company_Name: row.Company_name,
                    company_reserved_slots: row.basement_reserved_slots || 0,
                    four_reserved_slots: row.four_wheeler_slots_reserved || 0,
                    two_reserved_slots: row.two_wheeler_slots_reserved || 0

                })
                total_baement_reserved = total_baement_reserved + row.basement_reserved_slots
                total_four_wheeler_reserved = total_four_wheeler_reserved + row.four_wheeler_slots_reserved
                total_two_wheeler_reserved = total_two_wheeler_reserved + row.two_wheeler_slots_reserved
            })

            if (basementwisevehicledata.length > 0) {
                worksheet.addRow({
                    serial_number: "",
                    company_Name: "Total", // Correct key
                    company_reserved_slots: total_baement_reserved,
                    four_reserved_slots: total_four_wheeler_reserved,
                    two_reserved_slots: total_two_wheeler_reserved,

                }).font = { bold: true };
            }

            const lastRow = worksheet.lastRow; // Get the last row
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
            const fileName = `${basementName}_Basement_report.xlsx`;

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    "Content-Disposition": `attachment; filename="${fileName}"`,
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