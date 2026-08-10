import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  "https://zcshqqrjxiharymzesnl.supabase.co",
  "sb_publishable_kaHcZU4PciFFO5YICmkh_w_YBru5T2X",
);

const nextTourTextCon = document.getElementById("nextTourTextCon");

async function loadTourData() {
  try {
    const { data, error } = await supabase
      .from("tour_data")
      .select("*")
      .eq("id", "next-tour")
      .maybeSingle();

    if (error) throw error;

    if (data) {
      nextTourTextCon.innerHTML = `
        <span class="nextTourText"><span class="nextTourTextB">Zielort:</span> ${data.destination}</span>
        <span class="nextTourText"><span class="nextTourTextB">Datum:</span> ${data.date}</span>
        <span class="nextTourText"><span class="nextTourTextB">Entfernung & Dauer:</span> ${data.information}</span>
        <a href="${data.routeLink}" class="mainItemBtn nextTourLink">Route ansehen</a>
      `;
    } else {
      nextTourTextCon.innerHTML = `
        <span class="nextTourText">Derzeit ist keine Tour geplant.</span>
      `;
    }
  } catch (error) {
    console.error("Error while Loading Data:", err.message);
  }
}

loadTourData();
