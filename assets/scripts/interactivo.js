// Polyfill

SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(elem) {
    return elem.getScreenCTM().inverse().multiply(this.getScreenCTM());
};

// Global variables
var g_vis_simulator;
d3.formatDefaultLocale({
    decimal: ",",
    thousands: ".",
    grouping: 3,
    currency: "$"
});
var fmt = d3.format('.2f');

$.when($.ready).then(function () {
    g_vis_simulator = new VisSimulator('vis-simulator');
    $('#select-indicator').on('change', function () {
        g_vis_simulator.update_indicator($('#select-indicator').val());
    });

    if(isIE()) {
        d3.select('.modal.advertencia').classed('is-active', true);
    }
});

var seleccionar_tab = function (tab) {

    d3.selectAll('.tab-container').classed('is-hidden', true)
    d3.selectAll('.tab').classed('is-active', false);
    d3.select('#' + tab).classed('is-hidden', false);
    d3.select('#info-container').classed('is-hidden', false);
    d3.select('#source-container').classed('is-hidden', false);
    d3.select('#tab-' + tab).classed('is-active', true);

    if(d3.select('#publications-container').classed('is-hidden')) {
        d3.select('#publications-container').classed('is-hidden', false)
    }

};

var cerrar_modal = function(indicador_codigo) {
    d3.select('.modal.metodologia.' + indicador_codigo).classed('is-active', false);
}

function isIE() {
    var ua = window.navigator.userAgent; //Check the userAgent property of the window.navigator object
    var msie = ua.indexOf('MSIE '); // IE 10 or older
    var trident = ua.indexOf('Trident/'); //IE 11

    return (msie > 0 || trident > 0);
};

var cerrar_aviso = function() {
    d3.select('.modal.advertencia').classed('is-active', false);
}

var abrir_modal = function(indicador_codigo) {
    d3.select('.modal.metodologia.' + indicador_codigo).classed('is-active', true);
}

var VisSimulator = (function () {

    // Vis variables
    var _container_id;
    var _container;
    var _bbox;
    var _width;
    var _height;
    var _svg;
    var _g;
    var _defs;
    var _padding;

    // Data variables
    var _indicator_selected;
    var _paises;
    var _ranking;
    var _cruces;
    var _indicadores;
    var _publicaciones;

    var _groups = ["A", "B", "C", "D", "E", "F", "G", "H"]

    // CONSTRUCTOR

    function Vis(container_id) {

        _container_id = container_id;
        _container = d3.select('#' + _container_id);
        _bbox = document.getElementById(_container_id).getBoundingClientRect();
        _width = _bbox.width;
        _height = _width * 1.5;
        _padding = 10;

        this.renderizar();
    }

    /*
     Private methods
     */

    var _delete_vis = function () {
        _container.html('');
    };

    var _create_svg_container = function () {
        _svg = _container.append('svg')
            .attr('width', _width)
            .attr('height', _height);
        _g = _svg.append('g');
        _g.attr('id', 'main-g');
    };

    var _resize_svg = function () {
        _svg.attr('height', _g.node().getBBox().height);
    };

    var _draw = function () {

        _load_matches();
    };

    var _load_data = function (fn) {

        d3.dsv(",", "assets/data/ranking.csv", function (d) {
            return {
                "grupo": d.GRUPO,
                "pais": d.PAIS,
                "codigo_pais": d.CODIGO_PAIS,
                "indicador": d.INDICADOR,
                "codigo_indicador": d.CODIGO_INDICADOR,
                "puntaje": d.PUNTAJE === '' ? 'Sin datos' : +d.PUNTAJE,
                "ranking": +d.RANKING,
                "ranking_global": +d.RANKING_GLOBAL
            }
        }).then(function (data) {
            _ranking = data;
        });

        d3.dsv(",", "assets/data/cruces.csv", function (d) {
            return {
                "izquierda": d.IZQUIERDA,
                "derecha": d.DERECHA,
                "centro": d.CENTRO
            }
        }).then(function (data) {
            _cruces = data;
        });

        d3.dsv(",", "assets/data/indicadores.csv", function (d) {
            return {
                "indicador_codigo": d.INDICADOR_CODIGO,
                "indicador_descripcion_breve": d.INDICADOR_DESC_BREVE,
                "indicador_descripcion_larga": d.INDICADOR_DESC_LARGA,
                "fuente": d.FUENTE,
                "fuente_url": d.FUENTE_URL
            }
        }).then(function (data) {
            _indicadores = data;
        });

        d3.dsv(",", "assets/data/publicaciones.csv", function (d) {
            return {
                "titulo": d.TITULO,
                "descripcion": d.DESCRIPCION,
                "indicador_codigo": d.INDICADOR_CODIGO,
                "url": d.URL,
                "image": d.IMAGE
            }
        }).then(function (data) {
            _publicaciones = data;
        });

        fn();
    };

    var _load_matches = function () {

        d3.text('assets/images/matches-flechas.svg').then(function (text) {
            _container.html(text);
            _svg = d3.select('svg#matches-svg');
            _defs = d3.select('defs');
            _load_images();
        });
    };

    var _show_circles = function (fn) {
        var t = d3.transition().duration(100).ease(d3.easeLinear);
        d3.selectAll('g#knockout-16 > circle')
            .transition(t)
            .style('fill-opacity', 1)
            .on('end', function () {
                d3.selectAll('g#knockout-8 > circle').transition(t).style('fill-opacity', 1)
                    .on('end', function () {
                        d3.selectAll('g#knockout-4 > circle').transition(t).style('fill-opacity', 1)
                            .on('end', function () {
                                d3.selectAll('g#knockout-2 > circle').transition(t).style('fill-opacity', 1)
                                    .on('end', function () {
                                        d3.selectAll('g#knockout-1 > circle').transition(t).style('fill-opacity', 1)
                                            .on('end', function () {
                                                if (fn != undefined) fn();
                                            });
                                    });
                            });

                    });

            });
    }

    var _show_lines = function () {
        var t = d3.transition().ease(d3.easeLinear);
        d3.selectAll('g#lineas-octavos > path').transition(t).style('stroke-opacity', 1);
        d3.selectAll('g#lineas-cuartos > path').transition(t).style('stroke-opacity', 1);
        d3.selectAll('g#lineas-semis > path').transition(t).style('stroke-opacity', 1);
        d3.selectAll('g#lineas-final > path').transition(t).style('stroke-opacity', 1);
        $('#select-indicator').prop('disabled', false);
    };

    var _initial_animation = function () {
        _svg.transition().duration(300).style('opacity', 1);
        $('#select-indicator').prop('disabled', true);
        _show_circles(_show_lines);
    };

    var _load_images = function () {

        var ids = ['g#knockout-16', 'g#knockout-8', 'g#knockout-4', 'g#knockout-2', 'g#knockout-1'];

        ids.forEach(function (d) {
            var g = d3.select(d);

            g.selectAll('circle').each(function (d, i) {
                var c = d3.select(this);
                var id = c.attr('id');
                var cx = c.attr('cx');
                var cy = c.attr('cy');
                var r = c.attr('r');

                _defs.append('clipPath')
                    .attr('id', 'clip-circle-' + id)
                    .append('circle')
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('r', r);

                g.append('circle')
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('r', parseInt(r))
                    .style('stroke', '#222222')
                    .style('fill', 'none')
                    .style('stroke-width', '1.5px')
                    .style('stroke-opacity', 0.5);

                g.append('image')
                    .attr('class', 'flag ' + id)
                    .attr('x', cx - r)
                    .attr('y', cy - r)
                    .attr('width', r * 2)
                    .attr('height', r * 2)
                    .attr('clip-path', 'url(#clip-circle-' + id + ')');

            });

        });
    };

    var _calculate_winner = function (indicator_code) {
        _ocultar_banderas();
        _calculate_knockout_16(indicator_code);
        _calculate_knockout_8();
        _calculate_groups(indicator_code);
        _calculate_global(indicator_code);
        _mostrar_banderas();
    };

    var _calculate_knockout_16 = function (indicator_code) {

        var popup_single = d3.select('#popup-single');

        _ranking.forEach(function (d) {
            if ((d.ranking == 1 || d.ranking == 2) && d.codigo_indicador == indicator_code) {

                var img = d3.select('image.flag.' + d.grupo + d.ranking);

                img.attr('xlink:href', 'assets/images/flags/' + d.codigo_pais + '.svg')
                    .classed(d.codigo_pais, true)
                    .attr('data-indicator-score', +d.puntaje)
                    .attr('data-country-code', d.codigo_pais)
                    .attr('data-country', d.pais)
                    .on('mouseover', function() {

                        popup_single.select('text#pups-pais-nombre').html(d.pais);
                        popup_single.select('text#pups-pais-puntaje').html(d.puntaje);
                        popup_single.select('image#pups-flag').attr('xlink:href', 'assets/images/flags-square/' + d.codigo_pais + '.svg');

                        var tooltipParent = popup_single.node().parentElement;
                        var matrix = this.getTransformToElement(tooltipParent)
                            .translate(+this.getAttribute("x"), +this.getAttribute("y"));
                        popup_single.attr("transform", "translate(" + (matrix.e+10) + "," + (matrix.f) + ")");
                        popup_single.transition()
                            .style('opacity', 1);

                        //d3.selectAll('image.flag').transition().style('opacity', 0.1);
                        //d3.selectAll('image.flag.' + d.codigo_pais).transition().style('opacity', 1);

                        //d3.selectAll('path.country').transition().style('opacity', 0.1);
                        //d3.selectAll('path.country.' + d.codigo_pais).transition().style('opacity', 1);
                    })
                    .on('mouseout', function() {
                        popup_single
                            .attr('transform', 'translate(-100, -100)')
                            .transition()
                            .style('opacity', 0);

                        //d3.selectAll('image.flag').transition().style('opacity', 1);
                        //d3.selectAll('path.country').transition().style('opacity', 1);
                    });


            }
        });
    };

    var _calculate_knockout_8 = function () {
        var popup_vs = d3.select('#popup-vs');

        _cruces.forEach(function (c) {
            c.izquierda
            var score_left = parseFloat(d3.select('image.flag.' + c.izquierda).attr('data-indicator-score'));
            var country_left = d3.select('image.flag.' + c.izquierda).attr('data-country-code');
            var country_name_left = d3.select('image.flag.' + c.izquierda).attr('data-country');

            var score_right = parseFloat(d3.select('image.flag.' + c.derecha).attr('data-indicator-score'));
            var country_right = d3.select('image.flag.' + c.derecha).attr('data-country-code');
            var country_name_right = d3.select('image.flag.' + c.derecha).attr('data-country');

            var sc;
            var cc;
            var cn;
            if (score_left >= score_right) {
                sc = score_left;
                cc = country_left;
                cn = country_name_left;
            } else {
                sc = score_right;
                cc = country_right;
                cn = country_name_right;
            }
            d3.select('image.flag.' + c.centro)
                .classed(cc, true)
                .attr('xlink:href', 'assets/images/flags/' + cc + '.svg')
                .attr('data-indicator-score', sc)
                .attr('data-country-code', cc)
                .attr('data-country', cn)
                .on('mouseover', function() {
                    popup_vs.select('text#g1-pais-nombre').html(country_name_left);
                    popup_vs.select('text#g2-pais-nombre').html(country_name_right);

                    popup_vs.select('text#g1-pais-puntaje').html(score_left);
                    popup_vs.select('text#g2-pais-puntaje').html(score_right);

                    popup_vs.select('image#g1-flag').attr('xlink:href', 'assets/images/flags-square/' + country_left + '.svg');
                    popup_vs.select('image#g2-flag').attr('xlink:href', 'assets/images/flags-square/' + country_right + '.svg');

                    var tooltipParent = popup_vs.node().parentElement;
                    var matrix = this.getTransformToElement(tooltipParent).translate(+this.getAttribute("x") + +this.getAttribute("width") / 2, +this.getAttribute("y"));
                    popup_vs.attr("transform", "translate(" + (matrix.e) + "," + (matrix.f+57) + ")");
                    popup_vs.transition().style('opacity', 1);

                    //d3.selectAll('image.flag').transition().style('opacity', 0.1);
                    //d3.selectAll('image.flag.' + cc).transition().style('opacity', 1);

                    //d3.selectAll('path.country').transition().style('opacity', 0.1);
                    //d3.selectAll('path.country.' + cc).transition().style('opacity', 1);
                })
                .on('mouseout', function() {
                    popup_vs
                        .attr('transform', 'translate(-100, -100)')
                        .transition()
                        .style('opacity', 0);

                    //d3.selectAll('image.flag').transition().style('opacity', 1);
                    //d3.selectAll('path.country').transition().style('opacity', 1);
                });
        });
    };

    var _calculate_groups = function (indicator_code) {
        var groups_container = d3.select('div#groups-container > div');
        groups_container.html('')
        var group_columns_div;
        _groups.forEach(function (group, i) {

            var equipos_grupo = _ranking.filter(function (d) {
                return d.grupo === group && d.codigo_indicador === indicator_code;
            }).sort(function (a, b) {
                return a.ranking - b.ranking;
            });

            if (i % 2 == 0) {
                group_columns_div = groups_container.append('div').classed('columns', true);
            }

            var group_div = group_columns_div.append('div').classed('column', true);
            group_div.append('div').classed('grupo-X grupo-' + group, true).html('Grupo ' + group);
            group_div.append('table')
                .attr('class', 'table is-fullwidth is-striped group-' + group)
                .html(
                    '<thead>\n' +
                    '<tr>\n' +
                    '<th>&nbsp;</th>\n' +
                    '<th>País</th>\n' +
                    '<th>Puntaje</th>\n' +
                    '</tr>\n' +
                    '</thead>\n' +
                    '<tbody>\n' +
                    '</tbody>'
                );

            var tbody = d3.select('table.group-' + group + ' > tbody');

            equipos_grupo.forEach(function (d) {
                var tr = tbody.append('tr');
                tr.append('td')
                    .style('width', '10%')
                    .style('background-image', 'url(assets/images/flags-square/' + d.codigo_pais + '.svg)')
                    .style('background-size', '70% 70%')
                    .style('background-position', '50% 50%')
                    .style('background-repeat', 'no-repeat');
                tr.append('td').style('width', '50%').html(d.pais);
                tr.append('td').style('width', '40%').html(d.puntaje);

            })
        });
    };

    var _calculate_global = function (indicator_code) {
        var global_container = d3.select('div#global-container > div');
        global_container.html('')

        var equipos_global = _ranking.filter(function (d) {
            return d.codigo_indicador === indicator_code;
        }).sort(function (a, b) {
            return a.ranking_global - b.ranking_global;
        });

        global_container.append('table')
            .attr('class', 'table is-fullwidth is-striped global')
            .html(
                '<thead>\n' +
                '<tr>\n' +
                '<th>Pos.</th>\n' +
                '<th>&nbsp;</th>\n' +
                '<th>País</th>\n' +
                '<th>Puntaje</th>\n' +
                '</tr>\n' +
                '</thead>\n' +
                '<tbody>\n' +
                '</tbody>'
            );

        var tbody = d3.select('table.global > tbody');

        equipos_global.forEach(function (d) {
            var tr = tbody.append('tr');
            tr.append('td').style('width', '10%').html(d.ranking_global);
            tr.append('td')
                .style('width', '10%')
                .style('background-image', 'url(assets/images/flags-square/' + d.codigo_pais + '.svg)')
                .style('background-size', '70% 70%')
                .style('background-position', '50% 50%')
                .style('background-repeat', 'no-repeat');
            tr.append('td').style('width', '50%').html(d.pais);
            tr.append('td').style('width', '30%').html(d.puntaje)

        })
    };

    var _mostrar_banderas = function () {
        d3.selectAll('image.flag').transition().style('opacity', 1);
    };

    var _ocultar_banderas = function () {
        d3.selectAll('image.flag').transition().style('opacity', 0);
    };

    // PUBLIC METHODS
    Vis.prototype = {
        renderizar: function () {
            _delete_vis();
            _load_data(_draw);
        },
        update_indicator: function (indicator_code) {

            _initial_animation();

            if (d3.select('#tabs-selector').classed('is-hidden')) d3.select('#tabs-selector').classed('is-hidden', false);
            if (d3.select('#info-container').classed('is-hidden')) d3.select('#info-container').classed('is-hidden', false);
            if (d3.select('#source-container').classed('is-hidden')) d3.select('#source-container').classed('is-hidden', false);
            if (d3.select('#tab-groups-container').classed('is-active')) d3.select('#groups-container').classed('is-hidden', false);
            if (d3.select('#subscribe-container').classed('is-hidden')) d3.select('#subscribe-container').classed('is-hidden', false);

            if(d3.select('#publications-container').classed('is-hidden')) {
                d3.select('#publications-container').classed('is-hidden', false)
            }

            _calculate_winner(indicator_code)

            var indicador = _indicadores.filter(function (d) {
                return d.indicador_codigo === indicator_code;
            })[0];

            d3.select('#info-container-content')
                .html('')
                .append('p')
                .html(indicador.indicador_descripcion_breve);

            d3.select('#info-container-content')
                .append('p')
                .classed('no-margin', true)
                .html(
                    '<a class="button is-primary" onclick="abrir_modal(\'' + indicador.indicador_codigo + '\')">\n' +
                    '    <span class="icon">\n' +
                    '      <i class="fa fa-info-circle"></i>\n' +
                    '    </span>\n' +
                    '    <span>Más información</span>\n' +
                    '  </a>')
                //.html('<span class="button is-primary tooltip" data-tooltip="Ir a la metodología" onclick="abrir_modal(\'' + indicador.indicador_codigo + '\')">Más información</span>');

            var publicaciones = _publicaciones.filter(function (d) {
                return d.indicador_codigo === indicator_code;
            });

            var publications_container = d3.select('#publications-container > div');
            publications_container.html('');


            publications_container.append('h3').html('¿Cómo pueden los países mejorar sus indicadores de desarrollo?');
            publications_container.append('p').html('En estas publicaciones y blogs descubrirás proyectos, iniciativas y soluciones para que los países de América Latina y el Caribe se conviertan en campeones del desarrollo. ');

            publicaciones.forEach(function (publicacion) {

                publications_container.html(
                    publications_container.html() +
                    '<div class="box">' +
                    '<div class="columns publication">' +
                    '  <div class="column">' +
                    '    <img src="assets/images/publicaciones/' + publicacion.image + '.jpg">' +
                    '  </div>' +
                    '  <div class="column is-two-thirds">' +
                    '    <p><strong>' + publicacion.titulo + '</strong><br/>' + publicacion.descripcion + '</p>' +
                    '    <p>' +
                    '      <a target="_blank" href="' + publicacion.url + '">' +
                    '        <span class="icon is-small"><i class="fas fa-external-link-alt"></i></span>&nbsp;Enlace' +
                    '      </a>' +
                    '    </p>' +
                    '  </div>' +
                    '  </div>' +
                    '</div>');
            });

        },
        mostrar_banderas: function () {
            _mostrar_banderas();
        },
        ocultar_banderas: function () {
            _ocultar_banderas();
        }
    };

    return Vis;

})();
