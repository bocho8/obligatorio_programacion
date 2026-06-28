/*
   Autores: Fabrizio Pedemonti - N°: 372959 - Grupo: M1C
            Agustin Roizen - N°: 350021 - Grupo: M1C
*/

class Influencer {
    constructor(nombre, email, comision) {
        this.nombre = nombre;
        this.email = email;
        this.comision = comision;
    }
}

class Articulo {
    constructor(codigo, descripcion, precio) {
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.precio = precio;
    }
}

class Venta {
    constructor(numero, codigoArticulo, influencerEmail, cantidad, medio) {
        this.numero = numero;
        this.codigoArticulo = codigoArticulo;
        this.influencerEmail = influencerEmail;
        this.cantidad = cantidad;
        this.medio = medio;
    }
}

class Sistema {
    constructor() {
        this.influencers = [];
        this.articulos = [];
        this.ventas = [];
        this.proximoNumero = 1;
    }

    existeInfluencerEmail(email) {
        for (let inf of this.influencers) {
            if (inf.email === email) {
                return true;
            }
        }
        return false;
    }

    existeArticuloCodigo(codigo) {
        for (let art of this.articulos) {
            if (art.codigo === codigo) {
                return true;
            }
        }
        return false;
    }

    agregarInfluencer(influencer) {
        if (this.existeInfluencerEmail(influencer.email)) {
            throw new Error("Ya existe un influencer con ese email.");
        }
        this.influencers.push(influencer);
    }

    agregarArticulo(articulo) {
        if (this.existeArticuloCodigo(articulo.codigo)) {
            throw new Error("Ya existe un artículo con ese código.");
        }
        this.articulos.push(articulo);
    }

    buscarArticulo(codigo) {
        for (let art of this.articulos) {
            if (art.codigo === codigo) {
                return art;
            }
        }
        return null;
    }

    buscarInfluencer(email) {
        for (let inf of this.influencers) {
            if (inf.email === email) {
                return inf;
            }
        }
        return null;
    }

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

    eliminarVenta(numero) {
        let seguir = true;
        for (let i = 0; i < this.ventas.length && seguir; i++) {
            if (this.ventas[i].numero === numero) {
                this.ventas.splice(i, 1);
                seguir = false;
            }
        }
    }

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

    montoVenta(venta) {
        let articulo = this.buscarArticulo(venta.codigoArticulo);
        if (articulo) {
            return venta.cantidad * articulo.precio;
        }
        return 0;
    }

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
