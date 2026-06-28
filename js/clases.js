/*
   Autores: Fabrizio Pedemonti - N°: 372959 - Grupo: M1C
            Agustin Roizen - N°: 350021 - Grupo: M1C
*/

// CLASES DEL MODELO
// Cada clase representa una entidad del sistema. Las relaciones son:
//   Influencer ──< Venta >── Articulo
// El email del influencer y el código del artículo son las claves
// primarias. El número de venta es autoincremental.

// Guarda nombre, email (único) y porcentaje de comisión.
// La comisión se guarda como número (ej: 10.5 = 10.5%) y después
// en los cálculos se divide entre 100.
class Influencer {
    constructor(nombre, email, comision) {
        this.nombre = nombre;
        this.email = email;
        this.comision = comision;
    }
}

// Código en mayúsculas (se fuerza en el form con .toUpperCase()).
// El precio es unitario, en pesos.
class Articulo {
    constructor(codigo, descripcion, precio) {
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.precio = precio;
    }
}

// El número lo asigna el Sistema, no se pasa manualmente.
// medio es 1-6: Instagram, YouTube, X, TikTok, Facebook, Otras.
// cantidad son las unidades vendidas de ESE artículo en ESA venta.
class Venta {
    constructor(numero, codigoArticulo, influencerEmail, cantidad, medio) {
        this.numero = numero;
        this.codigoArticulo = codigoArticulo;
        this.influencerEmail = influencerEmail;
        this.cantidad = cantidad;
        this.medio = medio;
    }
}

// Acá está toda la lógica. Tres arrays + contador de número de venta.
// Las listas arrancan vacías (sin datos precargados).
class Sistema {
    constructor() {
        this.influencers = [];
        this.articulos = [];
        this.ventas = [];
        this.proximoNumero = 1;     // arranca en 1, va subiendo solo
    }

    // BÚSQUEDAS Y EXISTENCIAS — todo con for...of

    // Chequea si ya existe un influencer con ese email.
    // Devuelve true/false, lo uso como guarda en agregarInfluencer.
    existeInfluencerEmail(email) {
        for (let inf of this.influencers) {
            if (inf.email === email) {
                return true;
            }
        }
        return false;
    }

    // Mismo patrón pero para código de artículo.
    existeArticuloCodigo(codigo) {
        for (let art of this.articulos) {
            if (art.codigo === codigo) {
                return true;
            }
        }
        return false;
    }

    // Devuelve el objeto Articulo completo, o null si no existe.
    // Se usa en totalComisiones(), renderTablaVentas() y mostrarDetalle().
    buscarArticulo(codigo) {
        for (let art of this.articulos) {
            if (art.codigo === codigo) {
                return art;
            }
        }
        return null;
    }

    // Devuelve el objeto Influencer completo, o null.
    buscarInfluencer(email) {
        for (let inf of this.influencers) {
            if (inf.email === email) {
                return inf;
            }
        }
        return null;
    }

    // ALTAS — validan unicidad y tiran Error si algo falla

    // Si el email ya existe tira Error — el form lo atrapa con try/catch.
    agregarInfluencer(influencer) {
        if (this.existeInfluencerEmail(influencer.email)) {
            throw new Error("Ya existe un influencer con ese email.");
        }
        this.influencers.push(influencer);
    }

    // Si el código ya existe tira Error.
    agregarArticulo(articulo) {
        if (this.existeArticuloCodigo(articulo.codigo)) {
            throw new Error("Ya existe un artículo con ese código.");
        }
        this.articulos.push(articulo);
    }

    // Alta de venta — el método más largo porque valida tres cosas:
    //  1. Que haya al menos un artículo y un influencer
    //  2. Que el artículo exista
    //  3. Que el influencer exista
    // Si todo OK, crea la Venta con próximoNumero y lo incrementa.
    agregarVenta(codigoArticulo, influencerEmail, cantidad, medio) {
        if (this.articulos.length === 0 || this.influencers.length === 0) {
            throw new Error("Debe haber al menos un artículo y un influencer registrados.");
        }

        let articulo = this.buscarArticulo(codigoArticulo);
        if (!articulo) {
            throw new Error("El artículo no existe.");
        }

        let influencer = this.buscarInfluencer(influencerEmail);
        if (!influencer) {
            throw new Error("El influencer no existe.");
        }

        let venta = new Venta(this.proximoNumero, codigoArticulo, influencerEmail, cantidad, medio);
        this.ventas.push(venta);
        this.proximoNumero++;
        return venta;
    }

    // BAJA DE VENTA — splice con bandera
    // Recorro con for clásico (necesito el índice para el splice).
    // La bandera 'seguir' corta el loop después de borrar, para no
    // seguir iterando después de modificar el array.
    eliminarVenta(numero) {
        let seguir = true;
        for (let i = 0; i < this.ventas.length && seguir; i++) {
            if (this.ventas[i].numero === numero) {
                this.ventas.splice(i, 1);
                seguir = false;
            }
        }
    }

    // FILTRADO DE VENTAS POR INFLUENCER — para el modal de detalle
    // Filtra con for...of + push a array resultado.
    // Ordena por número de venta (ascendente) con sort + function comparator.
    ventasDeInfluencer(email) {
        let resultado = [];
        for (let venta of this.ventas) {
            if (venta.influencerEmail === email) {
                resultado.push(venta);
            }
        }
        resultado.sort(function (a, b) {
            return a.numero - b.numero;
        });
        return resultado;
    }

    // COMISIONES — acá está la fórmula que más preguntan en la defensa
    // Fórmula: comisión = cantidad * precio_unitario * (comision% / 100)
    // Suma eso para cada venta del influencer.
    // Busca el artículo en cada iteración para agarrar el precio actual.
    // Si por algún motivo el artículo ya no existe, esa venta suma 0
    // (es defensivo, no debería pasar porque no dejamos borrar artículos).
    totalComisiones(influencer) {
        let total = 0;
        for (let venta of this.ventas) {
            if (venta.influencerEmail === influencer.email) {
                let articulo = this.buscarArticulo(venta.codigoArticulo);
                if (articulo) {
                    total += venta.cantidad * articulo.precio * (influencer.comision / 100);
                }
            }
        }
        return total;
    }

    // Helper: monto total de una venta (cantidad * precio unitario).
    // Lo separé en un método porque se usa en dos lugares:
    // influencerVentaMasCara() y totalVendidoPorMedio().
    montoVenta(venta) {
        let articulo = this.buscarArticulo(venta.codigoArticulo);
        if (articulo) {
            return venta.cantidad * articulo.precio;
        }
        return 0;
    }

    // MEDALLAS — tres métodos que buscan al "mejor" en cada categoría

    // 🔥 Top comisión: recorre todos los influencers, calcula su total
    // y se queda con el que tenga el mayor.
    // maxTotal arranca en -1 así que si todas las comisiones son 0
    // igual agarra al primero (puede pasar si nadie vendió nada).
    influencerTopComision() {
        if (this.influencers.length === 0) {
            return null;
        }
        let mejor = null;
        let maxTotal = -1;
        for (let inf of this.influencers) {
            let total = this.totalComisiones(inf);
            if (total > maxTotal) {
                maxTotal = total;
                mejor = inf;
            }
        }
        return mejor;
    }

    // 🟢 Venta más cara: doble for anidado.
    // Para cada influencer recorro todas sus ventas y me quedo con
    // el de mayor monto. Si hay empate gana el primero que encuentra.
    influencerVentaMasCara() {
        if (this.influencers.length === 0) {
            return null;
        }
        let mejorInf = null;
        let maxMonto = -1;
        for (let inf of this.influencers) {
            for (let venta of this.ventas) {
                if (venta.influencerEmail === inf.email) {
                    let monto = this.montoVenta(venta);
                    if (monto > maxMonto) {
                        maxMonto = monto;
                        mejorInf = inf;
                    }
                }
            }
        }
        return mejorInf;
    }

    // ⭐ Artículo más vendido (por unidades, no por monto).
    // Uso un objeto como diccionario: clave = código, valor = unidades.
    // Primer loop: inicializa todo en 0.
    // Segundo loop: acumula cantidades de cada venta.
    // Tercer loop: busca el máximo.
    articuloMasVendido() {
        if (this.articulos.length === 0) {
            return null;
        }
        let unidadesPorArticulo = {};
        for (let art of this.articulos) {
            unidadesPorArticulo[art.codigo] = 0;
        }
        for (let venta of this.ventas) {
            unidadesPorArticulo[venta.codigoArticulo] += venta.cantidad;
        }
        let maxUnidades = -1;
        let mejorArt = null;
        for (let art of this.articulos) {
            if (unidadesPorArticulo[art.codigo] > maxUnidades) {
                maxUnidades = unidadesPorArticulo[art.codigo];
                mejorArt = art;
            }
        }
        return mejorArt;
    }

    // GRÁFICO DE BURBUJAS — total vendido por cada medio
    // Suma el monto de todas las ventas de un medio específico.
    // Se llama 6 veces desde dibujarBurbujas(), una por cada medio.
    totalVendidoPorMedio(medio) {
        let total = 0;
        for (let venta of this.ventas) {
            if (venta.medio === medio) {
                total += this.montoVenta(venta);
            }
        }
        return total;
    }
}
