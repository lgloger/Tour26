import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  "https://zcshqqrjxiharymzesnl.supabase.co",
  "sb_publishable_kaHcZU4PciFFO5YICmkh_w_YBru5T2X",
);

async function getTourList() {
  const { data: mainItems, error: mainError } = await supabase.storage
    .from("touren")
    .list("", {
      sortBy: { column: "name", order: "desc" },
    });

  if (mainError) throw mainError;

  const fullTourData = await Promise.all(
    mainItems.map(async (folder) => {
      const folderName = folder.name;

      const { data: files, error: filesError } = await supabase.storage
        .from("touren")
        .list(folderName);

      if (filesError) {
        console.error(`Error while Loading ${folderName}:`, filesError);
        return null;
      }

      const hasInfo = files.some((f) => f.name === "info.json");
      const collageFile = files.find((f) => f.name.startsWith("collage."));

      if (!hasInfo || !collageFile) {
        return null;
      }

      // Signed URLs
      const { data: signedUrlData } = await supabase.storage
        .from("touren")
        .createSignedUrl(`${folderName}/${collageFile.name}`, 3600);

      // info.json laden
      const { data: jsonBlob, error: jsonError } = await supabase.storage
        .from("touren")
        .download(`${folderName}/info.json`);

      let infoData = {
        name: folderName,
        displayName: folderName,
        date: "",
        totalTimeHour: "/",
        totalTimeMinute: "/",
        movementTimeHour: "/",
        movementTimeMinute: "/",
        range: "Unbekannt",
        averageSpeed: "/",
        members: "",
        routeId: "0",
      };

      if (!jsonError && jsonBlob) {
        const jsonText = await jsonBlob.text();
        try {
          const parsed = JSON.parse(jsonText);
          infoData = { ...infoData, ...parsed };
          if (parsed.name) infoData.displayName = parsed.name;
        } catch (e) {
          console.error(`Ungültiges JSON in Ordner ${folderName}`, e);
        }
      }

      return {
        ...infoData,
        folderName: folderName,
        collageUrl: signedUrlData.signedUrl,
      };
    }),
  );

  return fullTourData.filter((tour) => tour !== null);
}

function renderTourCards(touren) {
  const container = document.getElementById("mainItemCon");
  if (!container) return;
  container.innerHTML = ``;

  touren.forEach((tour) => {
    const card = document.createElement("div");
    card.className = "mainItem blurEffect";

    card.innerHTML = `
          <div class="mainItemConFirst">
            <span class="mainItemHeader">${tour.displayName || tour.name}</span>
            <span class="mainItemDate">${tour.date}</span>
          </div>
          
          <div class="mainItemImageCon">
            <a
              href="${tour.routeLink}"
              target="_blank"
              rel="nofollow noopener noreferrer"
              class="mainItemImageLink"
              ><iframe
                src="https://www.komoot.com/tour/${tour.routeId}/embed?hl=de&amp;layout=map"
                class="mainItemImageIFrame"
                frameborder="0"
                scrolling="no"
              ></iframe
            ></a>
            <img src="${tour.collageUrl}" alt="Collage" class="mainItemImageCollage">
          </div>
          <div class="mainItemInfoCon">
            <div class="mainItemInfo">
              <span class="mainItemInfoHeader">Gesamtzeit</span>
              <span class="mainItemInfoValue"
                >${tour.totalTimeHour} <span class="mainItemInfoValueS">Std</span> ${tour.totalTimeMinute}
                <span class="mainItemInfoValueS">M</span></span
              >
            </div>
            <div class="mainItemInfo">
              <span class="mainItemInfoHeader">Bewegungszeit</span>
              <span class="mainItemInfoValue"
                >${tour.movementTimeHour} <span class="mainItemInfoValueS">Std</span> ${tour.movementTimeMinute}
                <span class="mainItemInfoValueS">M</span></span
              >
            </div>
            <div class="mainItemInfo">
              <span class="mainItemInfoHeader">Distanz</span>
              <span class="mainItemInfoValue"
                >${tour.range} <span class="mainItemInfoValueS">km</span></span
              >
            </div>
            <div class="mainItemInfo">
              <span class="mainItemInfoHeader">Ø Geschwindigkeit</span>
              <span class="mainItemInfoValue"
                >${tour.averageSpeed} <span class="mainItemInfoValueS">km/h</span></span
              >
            </div>
             <div class="mainItemInfo">
              <span class="mainItemInfoHeader">Mitglieder</span>
              <span class="mainItemInfoValue"
                >${tour.members}</span
              >
            </div>
          </div>
          <a href="gallery.html?tour=${encodeURIComponent(tour.folderName)}" class="mainItemBtn">Tour Galerie</a>
    `;

    container.appendChild(card);
  });
}

async function init() {
  const touren = await getTourList();
  renderTourCards(touren);
}

init();
