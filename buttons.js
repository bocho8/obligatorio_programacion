//buttion para ordenar influencers

let sistema = new Sistema();
let ordenInterfAsc = true;
ler odenInterAsc = true;

//MOD   
const tbodyinft = document.getElementById("tbodyInfluencers");
const tbodyArt = document.getElementById("tbodyArticulos");
const tbodyVentas = document.getElementById("tbodyVentas");
const canvas = document.getElementById("bubbleCanvas");

//MAODALES
const dialogInf = document.getElementById("dialogInfluencers");
const dialogArt = document.getElementById("dialogArticulos");
const dialogVentas = document.getElementById("dialogVentas");
const dialogoDetalles = document.getElementById("dialogDetalles");

//BOTONES ABRIR MODALES
document.getElementById("btnAgregarInfluencer").onclick = () => dialogInf.showModal();
document.getElementById("btnAgregarArticulo").onclick = () => dialogArt.showModal();
document.getElementById("btnAgregarVenta").onclick = () => {poblarSelects(); dialogVentas.showModal();};

//BOTONES CERRAR MODALES
document.getElementById("cancelarInf").onclick = () => dialogInf.close();  
document.getElementById("cancelarArt").onclick = () => dialogArt.close();
document.getElementById("cancelarVenta").onclick = () => dialogVentas.close();
document.getElementById("cerrarDetalles").onclick = () => dialogoDetalles.close();

//FORMULARIOS
document.getElementById("formAgregarInfluencer").onsubmit = (e) => { e.preventDefault();
    const nombre = document.getElementById("nombreInf").value;
    const email = document.getElementById("emailInf").value;
    const comisciones = parseFloat(document.getElementById("comisionesInf").value);
    if (nombre || !email || isNaN(comisciones)) || comisciones < 0) {
        alert("Completa todos los campos correctamente (comisión >= 0)");
        return;
    }
    try {
        const nuevo = Influencers(nombre, email, comisciones);
        sistema.agregarInfluencer(nuevo);
        dialogInf.close();
        document.getElementById("formrInfluencer").reset();
        renderAll();
    } catch (error) {
        alert(error.message);
    }
};

document.getElementById("formAgregarArticulo").onsubmit = (e) => { e.preventDefault();
    const codigo = document.getElementById("artCodigo").value.trim().toUpperCase();
    const desc = document.getElementById("artDesc").value.trim();
    const precio = parseFloat(document.getElementById("artPrecio").value);
    if (!codigo || !desc || isNaN(precio) || precio <= 0) 
        alert("Código, descripción y precio válido requerido.");
        return; 
    }
    try {
        const nuevoArt = Articulo(codigo, desc, precio);
        sistema.agregarArticulo(nuevoArt);
        dialogArt.close();
        document.getElementById("formArticulo").reset();
        renderAll();
    } catch (error) {
        alert(error.message);
    }
};

document.getElementById("formAgregarVenta").onsubmit = (e) => { e.preventDefault();
    e.preventDefault();
    
