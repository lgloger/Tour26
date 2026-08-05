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

      let tourUrl = "";
      const { data: tourUrlData } = await supabase.storage
        .from("touren")
        .createSignedUrl(`${folderName}/tour.webp`, 3600);
      if (tourUrlData) tourUrl = tourUrlData.signedUrl;

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
        routeLink: "#",
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
        tourUrl: tourUrl,
      };
    }),
  );

  return fullTourData.filter((tour) => tour !== null);
}

function renderTourCards(touren) {
  const container = document.getElementById("mainSec");
  if (!container) return;

  touren.forEach((tour) => {
    const card = document.createElement("div");
    card.className = "tourCard";

    card.innerHTML = `
      <div class="tourCardHeader">
            <div class="tourCardHeaderTitleCon">
              <span class="tourCardHeaderTitle">
                <img class="tourCardHeaderTitleIcon" src="assets/icons/bike.svg" alt="bike-Icon" />
                ${tour.displayName || tour.name}
              </span>
              <span class="tourCardHeaderDate">${tour.date}</span>
            </div>
            <div class="tourCardHeaderInfoCon">
              <div class="tourCardHeaderInfoConCard">
                <span class="tourCardHeaderInfoConCardTitle">Gesamtzeit</span>
                <span class="tourCardHeaderInfoConCardInfo">
                  ${tour.totalTimeHour} <span class="tourCardInfoValue">Std</span> ${tour.totalTimeMinute} <span class="tourCardInfoValue">M</span>
                </span>
              </div>
              <div class="tourCardHeaderInfoConCard">
                <span class="tourCardHeaderInfoConCardTitle">Bewegungszeit</span>
                <span class="tourCardHeaderInfoConCardInfo">
                  ${tour.movementTimeHour} <span class="tourCardInfoValue">Std</span> ${tour.movementTimeMinute} <span class="tourCardInfoValue">M</span>
                </span>
              </div>
              <div class="tourCardHeaderInfoConCard">
                <span class="tourCardHeaderInfoConCardTitle">Distanz</span>
                <span class="tourCardHeaderInfoConCardInfo">${tour.range} <span class="tourCardInfoValue">km</span></span>
              </div>
              <div class="tourCardHeaderInfoConCard">
                <span class="tourCardHeaderInfoConCardTitle">Ø Geschwindigkeit</span>
                <span class="tourCardHeaderInfoConCardInfo">${tour.averageSpeed} <span class="tourCardInfoValue">km/h</span></span>
              </div>
              <div class="tourCardHeaderInfoConCard">
                <span class="tourCardHeaderInfoConCardTitle">Mitglieder</span>
                <span class="tourCardHeaderInfoConCardInfo">${tour.members}</span>
              </div>
            </div>
          </div>
          <div class="tourCardImageCon">
            <img class="tourCardImageConTour" src="${tour.tourUrl}" alt="tour-image" />
            <img class="tourCardImageConCollage" src="${tour.collageUrl}" alt="collage-image" />
          </div>
          <div class="tourCardBtnCon">
            <a class="tourCardBtn" href="${tour.routeLink}" title="Routen-Link">
              <img class="tourCardBtnIcon" src="assets/icons/map.svg" alt="map-Icon" />
              <span class="btnText">Route ansehen</span>
            </a>
            <a class="tourCardBtn" href="gallery.html?tour=${encodeURIComponent(tour.folderName)}" title="Tour-Galerie ansehen">
              <img class="tourCardBtnIcon" src="assets/icons/photo.svg" alt="photo-Icon" />
              <span class="btnText">Tour-Galerie ansehen</span>
            </a>
          </div>
    `;

    container.appendChild(card);
  });
}

async function init() {
  const touren = await getTourList();
  renderTourCards(touren);
}

init();
