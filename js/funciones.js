/*
   Autores: Fabrizio Pedemonti - N°: 372959 - Grupo: M1C
            Agustin Roizen - N°: 350021 - Grupo: M1C
*/

const sistema = new Sistema();

const MEDIOS = ["1-Instagram", "2-YouTube", "3-X", "4-TikTok", "5-Facebook", "6-Otras"];
const COLORES_BURBUJAS = ["#e1306c", "#ff0000", "#1da1f2", "#69c9d0", "#4267b2", "#888888"];

/* ── Referencias DOM ── */
const tbodyInf = document.getElementById("tbodyInfluencers");
const tbodyArt = document.getElementById("tbodyArticulos");
const tbodyVent = document.getElementById("tbodyVentas");
const canvas = document.getElementById("bubbleCanvas");

const dialogInf = document.getElementById("dialogInfluencers");
const dialogArt = document.getElementById("dialogArticulos");
const dialogVent = document.getElementById("dialogVentas");
const dialogDet = document.getElementById("dialogDetalles");

/* ── Estado de orden ── */
let ordenInfAsc = true;
let ordenArtAsc = true;

/* ── BOTONES ABRIR MODALES ── */
document.getElementById("btnAgregarInfluencer").onclick = () => dialogInf.showModal();
document.getElementById("btnAgregarArticulo").onclick = () => dialogArt.showModal();
document.getElementById("btnAgregarVenta").onclick = () => {
    if (sistema.articulos.length === 0 || sistema.influencers.length === 0) {
        alert("Debe haber al menos un artículo y un influencer registrados.");
        return;
    }
    poblarSelectsVenta();
    dialogVent.showModal();
};

/* ── BOTONES CERRAR MODALES ── */
document.getElementById("cancelarInf").onclick = () => dialogInf.close();
document.getElementById("cancelarArt").onclick = () => dialogArt.close();
document.getElementById("cancelarVent").onclick = () => dialogVent.close();
document.getElementById("cerrarDet").onclick = () => dialogDet.close();

/* ── FORMULARIOS ── */

// Alta Influencer
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

/* ── POBLAR SELECTS DE VENTA ── */
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

/* ── RENDERIZADO DE TABLAS ── */

function renderTablaInfluencers() {
    const topComision = sistema.influencerTopComision();
    const ventaMasCara = sistema.influencerVentaMasCara();

    let lista = [];
    for (let inf of sistema.influencers) {
        lista.push(inf);
    }
    lista.sort((a, b) => {
        const cmp = a.nombre.localeCompare(b.nombre);
        return ordenInfAsc ? cmp : -cmp;
    });

    tbodyInf.innerHTML = "";
    for (const inf of lista) {
        const total = sistema.totalComisiones(inf);
        const tieneVentas = sistema.ventasDeInfluencer(inf.email).length > 0;

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

        tr.querySelector(".btn-detalle").onclick = () => mostrarDetalle(inf);
        tbodyInf.appendChild(tr);
    }
}

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

function renderTablaVentas() {
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

        tr.querySelector(".btn-eliminar").onclick = () => {
            if (confirm("¿Eliminar la venta " + venta.numero + "?")) {
                sistema.eliminarVenta(venta.numero);
                renderAll();
            }
        };
        tbodyVent.appendChild(tr);
    }
}

/* ── DETALLE DE COMISIONES (DIALOG) ── */
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

/* ── GRÁFICO DE BURBUJAS ── */
function dibujarBurbujas() {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const totales = [];
    for (let m = 1; m <= 6; m++) {
        totales.push(sistema.totalVendidoPorMedio(m));
    }

    const maxTotal = Math.max(...totales, 0);
    const maxRadio = 38;

    const centroY = h / 2;
    const espaciado = w / 7;

    for (let i = 0; i < 6; i++) {
        const cx = espaciado * (i + 1);
        const cy = centroY;

        let radio;
        if (maxTotal === 0 || totales[i] === 0) {
            radio = maxRadio * 0.10;
        } else {
            radio = maxRadio * 0.10 + (totales[i] / maxTotal) * maxRadio * 0.90;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, radio, 0, 2 * Math.PI);
        ctx.fillStyle = COLORES_BURBUJAS[i];
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Monto dentro de la burbuja
        ctx.fillStyle = "#000";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$" + totales[i], cx, cy);

        // Etiqueta debajo
        ctx.fillStyle = "#333";
        ctx.font = "10px Arial";
        ctx.textBaseline = "top";
        ctx.fillText(MEDIOS[i], cx, cy + radio + 6);
    }
}

/* ── ORDENAMIENTO ── */
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

/* ── RENDER ALL ── */
function renderAll() {
    renderTablaInfluencers();
    renderTablaArticulos();
    renderTablaVentas();
    dibujarBurbujas();
}

/* ── INICIAL ── */
renderAll();
