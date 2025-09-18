"use server";
import Airtable from "airtable";
import { WaitlistPayload } from "./types";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export default base;

export async function joinWaitlist(
  payload: WaitlistPayload
): Promise<{ ok: true; message: string } | { ok: false; error: any }> {
  const table = base("tblrBuMDreDCF7NOU");
  try {
    // Check if email already exists
    const records = await table
      .select({
        filterByFormula: `AND({Email} = '${payload.email}', {Account_Type} = '${payload.accountType}')`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length > 0) {
      return {
        ok: true,
        message: "Email is already on the waitlist",
      };
    }

    await table.create([
      {
        fields: {
          Name: payload.name,
          Email: payload.email,
          Account_Type: payload.accountType,
        },
      },
    ]);
    return {
      ok: true,
      message: "Successfully joined the waitlist",
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.info ?? error.message ?? "Unknown error",
    };
  }
}
