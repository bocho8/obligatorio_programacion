/*
   Autores: Fabrizio Pedemonti - N°: 372959 - Grupo: M1C
            Agustin Roizen - N°: 350021 - Grupo: M1C
*/

// FUNCIONES DE UI — Todo lo que pinta en pantalla y reacciona
// a clicks vive acá. La lógica de negocio está en Sistema (clases.js).

// Una sola instancia. Todos los event handlers le pegan a 'sistema'.
const sistema = new Sistema();

// MEDIOS: array con las 6 redes sociales, índice = medio - 1.
// COLORES_BURBUJAS: un color distinto por medio para el gráfico.
const MEDIOS = ["1-Instagram", "2-YouTube", "3-X", "4-TikTok", "5-Facebook", "6-Otras"];
const COLORES_BURBUJAS = ["#e1306c", "#ff0000", "#1da1f2", "#69c9d0", "#4267b2", "#888888"];

// Referencias al DOM — una sola vez, en carga.
// Los guardo en variables globales para no hacer getElementById
// a cada rato. Si el HTML cambia, solo hay que tocar esto.
const tbodyInf = document.getElementById("tbodyInfluencers");
const tbodyArt = document.getElementById("tbodyArticulos");
const tbodyVent = document.getElementById("tbodyVentas");
const canvas = document.getElementById("bubbleCanvas");

const dialogInf = document.getElementById("dialogInfluencers");
const dialogArt = document.getElementById("dialogArticulos");
const dialogVent = document.getElementById("dialogVentas");
const dialogDet = document.getElementById("dialogDetalles");

// Estado de ordenamiento.
// true = ascendente, false = descendente. Cambian con los botones
// y renderTablaInfluencers/renderTablaArticulos los leen.
let ordenInfAsc = true;
let ordenArtAsc = true;

// EVENT HANDLERS — apertura y cierre de modales
// Los modales son <dialog> nativos del HTML5. showModal() los abre
// con backdrop gris automático (el ::backdrop lo maneja el CSS).

// Abrir modal de influencer — siempre se puede abrir.
document.getElementById("btnAgregarInfluencer").onclick = () => dialogInf.showModal();

// Abrir modal de artículo — siempre se puede abrir.
document.getElementById("btnAgregarArticulo").onclick = () => dialogArt.showModal();

// Abrir modal de venta — SOLO si hay al menos un artículo Y un influencer.
// Si no hay, muestra alert y no abre. El select se puebla justo antes
// de abrir para que siempre esté actualizado.
document.getElementById("btnAgregarVenta").onclick = () => {
    if (sistema.articulos.length === 0 || sistema.influencers.length === 0) {
        alert("Debe haber al menos un artículo y un influencer registrados.");
        return;
    }
    poblarSelectsVenta();
    dialogVent.showModal();
};

// Cerrar modales — con .close() vuelve a la página normal.
document.getElementById("cancelarInf").onclick = () => dialogInf.close();
document.getElementById("cancelarArt").onclick = () => dialogArt.close();
document.getElementById("cancelarVent").onclick = () => dialogVent.close();
document.getElementById("cerrarDet").onclick = () => dialogDet.close();

// FORMULARIOS DE ALTA — e.preventDefault() + validación + try/catch

// Alta Influencer
// Valida que los campos no estén vacíos y que la comisión sea >= 0.
// Si el sistema tira Error (email duplicado), lo muestra con alert.
// Después de agregar: cierra el modal, resetea el form y repinta todo.
document.getElementById("formAgregarInfluencer").onsubmit = (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreInf").value.trim();
    const email = document.getElementById("emailInf").value.trim();
    const comision = parseFloat(document.getElementById("comisionInf").value);

    if (!nombre || !email || isNaN(comision) || comision < 0) {
        alert("Todos los campos son requeridos. La comisión debe ser >= 0.");
        return;
    }
    try {
        sistema.agregarInfluencer(new Influencer(nombre, email, comision));
        dialogInf.close();
        document.getElementById("formAgregarInfluencer").reset();
        renderAll();
    } catch (err) {
        alert(err.message);
    }
};

// Alta Artículo
// El código se pasa a mayúsculas para evitar duplicados por case.
// Precio debe ser > 0.
document.getElementById("formAgregarArticulo").onsubmit = (e) => {
    e.preventDefault();
    const codigo = document.getElementById("codigoArt").value.trim().toUpperCase();
    const descripcion = document.getElementById("descArt").value.trim();
    const precio = parseFloat(document.getElementById("precioArt").value);

    if (!codigo || !descripcion || isNaN(precio) || precio <= 0) {
        alert("Todos los campos son requeridos. El precio debe ser > 0.");
        return;
    }
    try {
        sistema.agregarArticulo(new Articulo(codigo, descripcion, precio));
        dialogArt.close();
        document.getElementById("formAgregarArticulo").reset();
        renderAll();
    } catch (err) {
        alert(err.message);
    }
};

// Alta Venta
// Los selects de artículo e influencer se pueblan en poblarSelectsVenta().
// Cantidad >= 1. Medio ya viene del select (obligatorio, siempre tiene valor).
document.getElementById("formAgregarVenta").onsubmit = (e) => {
    e.preventDefault();
    const codigoArticulo = document.getElementById("selArticuloVenta").value;
    const influencerEmail = document.getElementById("selInfluencerVenta").value;
    const cantidad = parseInt(document.getElementById("cantidadVenta").value);
    const medio = parseInt(document.getElementById("selMedioVenta").value);

    if (!codigoArticulo || !influencerEmail || isNaN(cantidad) || cantidad < 1 || isNaN(medio)) {
        alert("Todos los campos son requeridos. La cantidad debe ser >= 1.");
        return;
    }
    try {
        sistema.agregarVenta(codigoArticulo, influencerEmail, cantidad, medio);
        dialogVent.close();
        document.getElementById("formAgregarVenta").reset();
        renderAll();
    } catch (err) {
        alert(err.message);
    }
};

// POBLAR SELECTS DE VENTA — se llama justo antes de abrir el modal
// Vacía los selects y los llena con los artículos e influencers
// que haya en el sistema en ese momento. Si se agregó algo nuevo
// desde la última vez que se abrió, aparece acá.
function poblarSelectsVenta() {
    const selArt = document.getElementById("selArticuloVenta");
    const selInf = document.getElementById("selInfluencerVenta");

    selArt.innerHTML = "";
    selInf.innerHTML = "";

    for (const art of sistema.articulos) {
        const opt = document.createElement("option");
        opt.value = art.codigo;
        opt.textContent = art.codigo + " - " + art.descripcion;
        selArt.appendChild(opt);
    }
    for (const inf of sistema.influencers) {
        const opt = document.createElement("option");
        opt.value = inf.email;
        opt.textContent = inf.nombre + " (" + inf.email + ")";
        selInf.appendChild(opt);
    }
}

// RENDERIZADO DE TABLAS — una función por cada tabla
// Las tres siguen el mismo patrón: copian la lista, ordenan, vacían
// el tbody y crean filas con createElement + innerHTML.

// Tabla de Influencers
// Columnas: Nombre | Email | % Comisión | Total a cobrar | Medallas | Detalle
// Medallas: se calculan acá mismo llamando a los métodos del sistema.
// El botón "Ventas" en cada fila abre el modal de detalle.
function renderTablaInfluencers() {
    const topComision = sistema.influencerTopComision();
    const ventaMasCara = sistema.influencerVentaMasCara();

    // Copio la lista para no modificar el array original del sistema
    let lista = [];
    for (let inf of sistema.influencers) {
        lista.push(inf);
    }
    // Ordeno por nombre. localeCompare maneja tildes y mayúsculas/minúsculas bien.
    lista.sort((a, b) => {
        const cmp = a.nombre.localeCompare(b.nombre);
        return ordenInfAsc ? cmp : -cmp;
    });

    tbodyInf.innerHTML = "";
    for (const inf of lista) {
        const total = sistema.totalComisiones(inf);
        const tieneVentas = sistema.ventasDeInfluencer(inf.email).length > 0;

        // Armo las medallas que le tocan a este influencer
        const medallas = [];
        if (topComision && inf.email === topComision.email) medallas.push("🔥");
        if (!tieneVentas) medallas.push("🧊");
        if (ventaMasCara && inf.email === ventaMasCara.email) medallas.push("🟢");

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${inf.nombre}</td>
            <td>${inf.email}</td>
            <td>${inf.comision}%</td>
            <td>${total}</td>
            <td>${medallas.join(" ")}</td>
            <td><button class="btn-detalle">Ventas</button></td>
        `;

        // El onclick va sobre el botón, no sobre la fila
        tr.querySelector(".btn-detalle").onclick = () => mostrarDetalle(inf);
        tbodyInf.appendChild(tr);
    }
}

// Tabla de Artículos
// Columnas: Código | Descripción | Precio | Medalla
// Orden por código (asc/desc). localeCompare porque los códigos son strings.
function renderTablaArticulos() {
    const masVendido = sistema.articuloMasVendido();

    let lista = [];
    for (let art of sistema.articulos) {
        lista.push(art);
    }
    lista.sort((a, b) => {
        const cmp = a.codigo.localeCompare(b.codigo);
        return ordenArtAsc ? cmp : -cmp;
    });

    tbodyArt.innerHTML = "";
    for (const art of lista) {
        const medalla = (masVendido && art.codigo === masVendido.codigo) ? "⭐" : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${art.codigo}</td>
            <td>${art.descripcion}</td>
            <td>${art.precio}</td>
            <td>${medalla}</td>
        `;
        tbodyArt.appendChild(tr);
    }
}

// Tabla de Ventas
// Siempre ordenada por número (ascendente), no hay toggle.
// Busca el nombre del influencer para mostrarlo en vez del email.
// El botón X en cada fila borra con confirm() antes.
function renderTablaVentas() {
    // Copia y ordena por número de venta
    let lista = [];
    for (let v of sistema.ventas) {
        lista.push(v);
    }
    lista.sort(function (a, b) {
        return a.numero - b.numero;
    });

    tbodyVent.innerHTML = "";
    for (const venta of lista) {
        const art = sistema.buscarArticulo(venta.codigoArticulo);
        const inf = sistema.buscarInfluencer(venta.influencerEmail);
        const nombreInf = inf ? inf.nombre : venta.influencerEmail;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${venta.numero}</td>
            <td>${venta.codigoArticulo}</td>
            <td>${nombreInf}</td>
            <td>${venta.cantidad}</td>
            <td>${MEDIOS[venta.medio - 1]}</td>
            <td><button class="btn-eliminar">X</button></td>
        `;

        // Borrado con confirm()
        tr.querySelector(".btn-eliminar").onclick = () => {
            if (confirm("¿Eliminar la venta " + venta.numero + "?")) {
                sistema.eliminarVenta(venta.numero);
                renderAll();    // repinta todo para que las medallas se actualicen
            }
        };
        tbodyVent.appendChild(tr);
    }
}

// MODAL DE DETALLE — ventas de un influencer con desglose de comisión
// Se abre desde el botón "Ventas" en la tabla de influencers.
// Muestra: Nro | Cantidad | Artículo | Precio Unit. | Total | $ Comisión
// Si no tiene ventas, muestra un mensaje en vez de tabla vacía.
function mostrarDetalle(influencer) {
    const ventas = sistema.ventasDeInfluencer(influencer.email);
    const tbody = document.getElementById("tbodyDetalle");
    const titulo = document.getElementById("tituloDetalle");

    titulo.textContent = "Ventas de " + influencer.nombre;
    tbody.innerHTML = "";

    if (ventas.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="6">No hay ventas para este influencer.</td>';
        tbody.appendChild(tr);
    } else {
        for (const venta of ventas) {
            const art = sistema.buscarArticulo(venta.codigoArticulo);
            const precioUnitario = art ? art.precio : 0;
            const totalVenta = venta.cantidad * precioUnitario;
            // Acá se aplica la misma fórmula que en totalComisiones()
            const comisionVenta = totalVenta * (influencer.comision / 100);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${venta.numero}</td>
                <td>${venta.cantidad}</td>
                <td>${venta.codigoArticulo}</td>
                <td>${precioUnitario}</td>
                <td>${totalVenta}</td>
                <td>${comisionVenta}</td>
            `;
            tbody.appendChild(tr);
        }
    }

    dialogDet.showModal();
}

// GRÁFICO DE BURBUJAS — Canvas, 6 burbujas alineadas
// Fórmula del radio:
//   radio = maxRadio * 0.10 + (total / maxTotal) * maxRadio * 0.90
// Esto asegura que:
//   - El mínimo es 10% del radio máximo (nunca desaparece)
//   - El máximo es 100% del radio máximo
//   - Los tamaños son proporcionales al monto total vendido
function dibujarBurbujas() {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Recolecto totales por cada medio (1 al 6)
    const totales = [];
    for (let m = 1; m <= 6; m++) {
        totales.push(sistema.totalVendidoPorMedio(m));
    }

    const maxTotal = Math.max(...totales, 0);   // si no hay ventas, maxTotal = 0
    const maxRadio = 38;                         // radio máximo en píxeles

    const centroY = h / 2;
    const espaciado = w / 7;    // 7 espacios para 6 burbujas centradas

    for (let i = 0; i < 6; i++) {
        const cx = espaciado * (i + 1);
        const cy = centroY;

        // Calculo el radio según la fórmula
        let radio;
        if (maxTotal === 0 || totales[i] === 0) {
            radio = maxRadio * 0.10;    // mínimo: 10%
        } else {
            radio = maxRadio * 0.10 + (totales[i] / maxTotal) * maxRadio * 0.90;
        }

        // Dibujo la burbuja
        ctx.beginPath();
        ctx.arc(cx, cy, radio, 0, 2 * Math.PI);
        ctx.fillStyle = COLORES_BURBUJAS[i];
        ctx.globalAlpha = 0.85;         // un toque de transparencia
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Monto centrado adentro de la burbuja
        ctx.fillStyle = "#000";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$" + totales[i], cx, cy);

        // Etiqueta con el nombre del medio, abajo de la burbuja
        ctx.fillStyle = "#333";
        ctx.font = "10px Arial";
        ctx.textBaseline = "top";
        ctx.fillText(MEDIOS[i], cx, cy + radio + 6);
    }
}

// BOTONES DE ORDENAMIENTO
document.getElementById("btnOrdenInfAsc").onclick = () => {
    ordenInfAsc = true;
    renderAll();
};
document.getElementById("btnOrdenInfDesc").onclick = () => {
    ordenInfAsc = false;
    renderAll();
};
document.getElementById("btnOrdenArtAsc").onclick = () => {
    ordenArtAsc = true;
    renderAll();
};
document.getElementById("btnOrdenArtDesc").onclick = () => {
    ordenArtAsc = false;
    renderAll();
};

// RENDER ALL — orquesta los 4 repintados
// Se llama después de cada alta, baja u orden. Garantiza que todo
// (tablas, medallas, burbujas) esté sincronizado.
function renderAll() {
    renderTablaInfluencers();
    renderTablaArticulos();
    renderTablaVentas();
    dibujarBurbujas();
}

// Primer renderizado al cargar la página.
// Las tablas arrancan vacías (sin datos precargados).
renderAll();
