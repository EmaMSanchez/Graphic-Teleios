document.addEventListener("DOMContentLoaded", async () => {
  const jsonURL = "https://demo.1810webdesign.com/wp-content/uploads/obras.json";
  const tiposContainer = document.getElementById("tipos-container");
  const popupContainer = document.getElementById("popup-container");
  const carousel = document.getElementById("carousel");
  const closeBtn = document.getElementById("close-popup");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  console.log("Iniciando script de obras...");

  if (!tiposContainer) {
    console.error("No existe #tipos-container en la página. Añade el div en Elementor.");
    return;
  }

  let data = [];
  let currentIndex = 0;
  let currentItems = [];

  // Fetch con manejo de errores y logs
  try {
    console.log("Intentando fetch a:", jsonURL);
    const res = await fetch(jsonURL, { cache: "no-store" });
    console.log("Fetch completed. status:", res.status);

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const raw = await res.json();
    console.log("Respuesta JSON cruda:", raw);

    // Normalizar estructura: si viene { obras: [...] } o directamente [...]
    if (Array.isArray(raw)) {
      data = raw;
    } else if (raw && Array.isArray(raw.obras)) {
      data = raw.obras;
    } else {
      // si no es un array conocido, intentar buscar la primera propiedad array
      const firstArray = Object.values(raw).find(v => Array.isArray(v));
      if (firstArray) {
        data = firstArray;
        console.warn("El JSON no era un array, se usó la primera propiedad array encontrada.");
      } else {
        throw new Error("Estructura JSON inesperada. No contiene un array de items.");
      }
    }

    console.log("Datos normalizados (array) - longitud:", data.length);
    if (!data.length) {
      tiposContainer.innerHTML = "<p style='color:orange;'>No hay datos en el JSON (array vacío).</p>";
      return;
    }

  } catch (err) {
    console.error("Error al cargar/parsing del JSON:", err);
    tiposContainer.innerHTML = `<p style="color:red;">Error cargando datos: ${err.message}</p>`;
    // Si es CORS, probablemente verás un error en la consola tipo 'Access to fetch at ... from origin ... has been blocked by CORS'
    return;
  }

  // Crear cards únicas por tipo (si existe la propiedad 'tipo')
  const tiposUnicos = [...new Set(data.map(item => item.tipo || "Sin tipo"))];
  console.log("Tipos únicos detectados:", tiposUnicos);

  tiposContainer.innerHTML = ""; // limpiar antes
  tiposUnicos.forEach(tipo => {
    const card = document.createElement("div");
    card.className = "tipo-card";
    card.textContent = tipo;
    card.addEventListener("click", () => mostrarPopup(tipo));
    tiposContainer.appendChild(card);
  });

  function mostrarPopup(tipo) {
    currentItems = data.filter(item => (item.tipo || "Sin tipo") === tipo);
    currentIndex = 0;
    renderCarrusel();
    if (popupContainer) popupContainer.classList.remove("hidden");
  }

  function renderCarrusel() {
    if (!carousel) {
      console.warn("No existe #carousel en la página.");
      return;
    }

    carousel.innerHTML = "";
    currentItems.forEach((obra, i) => {
      const item = document.createElement("div");
      item.className = "carousel-item";
      item.style.transform = `translateX(${(i - currentIndex) * 100}%)`;

      // Servicios puede ser string o array — normalizamos
      let serviciosText = "";
      try {
        if (Array.isArray(obra.servicios)) serviciosText = obra.servicios.join(", ");
        else if (typeof obra.servicios === "string") serviciosText = obra.servicios;
        else serviciosText = "";
      } catch (e) {
        serviciosText = "";
      }

      item.innerHTML = `
        <h3>${obra.nombre || "— sin nombre —"}</h3>
        <p><strong>Detalle:</strong> ${obra.detalle || "—"}</p>
        <p><strong>Contratista:</strong> ${obra.contratista || "—"}</p>
        <p><strong>Provincia:</strong> ${obra.provincia || "—"}</p>
        <p><strong>Servicios:</strong> ${serviciosText}</p>
        <p><strong>Periodo:</strong> ${obra.periodo || "—"}</p>
      `;
      carousel.appendChild(item);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderCarrusel();
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentIndex < currentItems.length - 1) {
        currentIndex++;
        renderCarrusel();
      }
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (popupContainer) popupContainer.classList.add("hidden");
    });
  }
  if (popupContainer) {
    popupContainer.addEventListener("click", (e) => {
      if (e.target === popupContainer) popupContainer.classList.add("hidden");
    });
  }

});
