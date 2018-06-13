$.when($.ready).then(function () {
    console.log("Document ready");

    var _indicadores;

    /*
    d3.dsv(",", "/assets/data/indicadores.csv", function (d) {
        return {
            "indicador": d.INDICADOR,
            "indicador_codigo": d.INDICADOR_CODIGO,
            "indicador_descripcion_breve": d.INDICADOR_DESC_BREVE,
            "indicador_descripcion_larga": d.INDICADOR_DESC_LARGA,
            "fuente": d.FUENTE,
            "fuente_url": d.FUENTE_URL
        }
    }).then(function (data) {
        _indicadores = data;

        var indicators_list = d3.select('ul.indicators-list');
        console.log(indicators_list);

        var c = d3.select('#indicators-container > div');
        var contenido = c.html();

        _indicadores.forEach(function (d) {
            indicators_list
                .append('li')
                .append('a')
                .attr('target', '_blank')
                .attr('href', '#' + d.indicador_codigo)
                .html(d.indicador);
            console.log(d);
            contenido += '<h2 id="' + d.indicador_codigo + '">' + d.indicador + '</h2>';
            contenido += d.indicador_descripcion_larga;
        });

        c.html(contenido);
    });
    */

});