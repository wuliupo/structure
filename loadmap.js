!( function () {
    /**
     * 全局缓存
     */
    var DATA = {};

    function covertName(type) {
        return type && type.replace( /\s+/g, '' ).replace( /\+/g, 'plus' ).replace( /#/g, 'sharp' ).toLowerCase();
    }

    function toogleActive(type) {
        var active = document.querySelector('[data-active]');
        if (active) {
            active.removeAttribute('data-active');
        }
        var active = document.querySelector('[data-id="' + type + '"]');
        if (active) {
            active.setAttribute('data-active', '');
        }
        document.querySelector('.kl_subtitle').innerHTML = active ? active.innerHTML : '';
    }

    /**
     * 加载数据
     * @param {*} obj 
     * @returns 
     */
    function loadData( type ) {
        type = covertName(type);
        if ( !type ) {
            return;
        }
        if ( DATA[ type ] ) {
            loadMap( type );
            return;
        }
        toogleActive(type);
        DATA[ type ] = {};
        ajax( 'data/' + type + '/node.json', function ( nodestr ) {
            DATA[ type ].nodestr = nodestr;
            ajax( 'data/' + type + '/link.json', function ( linkstr ) {
                DATA[ type ].linkstr = linkstr;
                loadMap( type );
            }, true );
        }, true );
    }

    /**
     * Ajax 请求
     * @param {*} url 
     * @param {*} callback 
     * @param {*} isJSON 
     * @returns 
     */
    function ajax( url, callback, isJSON ) {
        var xhr;
        if ( window.ActiveXObject ) {
            xhr = new ActiveXObject( "Microsoft.XMLHTTP" );
        } else if ( window.XMLHttpRequest ) {
            xhr = new XMLHttpRequest();
        } else {
            console.error( 'Cannot init ajax' );
            return;
        }

        xhr.onreadystatechange = function () {
            if ( xhr.readyState == 4 && xhr.status == 200 ) {
                callback( isJSON ? JSON.parse( xhr.responseText ) : xhr.responseText );
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                document.getElementById('mapRow').innerHTML = '数据加载错误';
            }
        };
        xhr.open( "GET", url, true );
        xhr.send( null );
    }

    /**
     * 加载结构图
     * @param {*} type 
     */
    function loadMap( type ) {
        var nodestr = DATA[ type ].nodestr,
            linkstr = DATA[ type ].linkstr;
        window.history.pushState( null, '', location.pathname + '?type=' + type );

        var graphOption = {
            id: "map",
            width: 1140,
            height: 1400
        };

        var colors = [ "#1f77b4", "#ff7f0e", "#2ca02c", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf" ],
            graphInstance = d3.select( "#mapRow" ).html( '' ).append( "svg" ).attr( graphOption ),
            graphContent = graphInstance.append( "g" ),
            graphEvent = d3.layout.force();

        graphEvent.on( "tick", function () {
                graphContent.selectAll( "line.link" ).each( function ( t ) {
                        var e, r, a, n, c = d3.select( this );
                        if ( "NEXT" == t.type ) {
                            var l = t.target.x - t.source.x,
                                i = t.target.y - t.source.y,
                                o = Math.sqrt( l * l + i * i ),
                                s = l / o,
                                u = i / o,
                                d = 35,
                                f = 35;
                            e = t.source.x + d * s,
                                r = t.target.x - f * s,
                                a = t.source.y + d * u,
                                n = t.target.y - f * u,
                                c.attr( "marker-end", "url(#arrow)" )
                        } else {
                            e = t.source.x;
                            a = t.source.y;
                            r = t.target.x;
                            n = t.target.y;
                        }
                        c.attr( "x1", e );
                        c.attr( "x2", r );
                        c.attr( "y1", a );
                        c.attr( "y2", n );
                    } ),
                    graphContent.selectAll( "g.node" ).selectAll( "circle.ring" ).attr( {
                        cx: function ( t ) {
                            return t.x
                        },
                        cy: function ( t ) {
                            return t.y
                        }
                    } ),
                    graphContent.selectAll( "g.node" ).selectAll( "circle.outline" ).attr( {
                        cx: function ( t ) {
                            return t.x
                        },
                        cy: function ( t ) {
                            return t.y
                        }
                    } ),
                    graphContent.selectAll( "g.node" ).selectAll( "text.nTxt" ).attr( {
                        x: function ( t ) {
                            return t.x - 15
                        },
                        y: function ( t ) {
                            return t.y + 6
                        }
                    } ),
                    graphContent.selectAll( "g.node" ).selectAll( "text.propName" ).attr( {
                        x: function ( t ) {
                            return t.x - 35
                        },
                        y: function ( t ) {
                            return t.y - 35
                        }
                    } ),
                    d.attr( {
                        x: function ( t ) {
                            return ( t.source.x + t.target.x ) / 2 - 25
                        },
                        y: function ( t ) {
                            return ( t.source.y + t.target.y ) / 2 + 5
                        },
                        transform: function ( t ) {
                            var e = t.target.x - t.source.x,
                                r = t.target.y - t.source.y,
                                a = 360 * Math.atan( r / e ) / ( 2 * Math.PI ),
                                n = ( t.target.x + t.source.x ) / 2,
                                c = ( t.target.y + t.source.y ) / 2;
                            return "rotate(" + a + "," + n + "," + c + ")"
                        }
                    } )
            } ).charge( -1300 ).linkDistance( 200 ).nodes( nodestr ).links( linkstr ).size( [ graphOption.width, graphOption.height ] ).alpha( .1 );

        graphInstance.append( "svg:defs" ).append( "svg:marker" ).attr( "id", "arrow" ).attr( "viewBox", "0 -5 10 10" ).attr( "refX", 6 ).attr( "markerWidth", 5 ).attr( "markerHeight", 5 ).attr( "orient", "auto" ).append( "svg:path" ).attr( "d", "M0,-5L10,0L0,5" ).attr( "fill", "#6ac6ff" );

        graphContent.selectAll( "line.link" ).data( linkstr ).enter().append( "line" ).attr( "class", "link" );

        var d = graphContent.selectAll( "link.desc" ).data( linkstr ).enter().append( "text" ).attr( "class", "desc" ).text( function ( t ) {
                return t.desc
            } ),
            f = ( graphEvent.drag().on( "dragstart", function ( t ) {
                    t.fixed = !0
                } ),
                graphContent.selectAll( "g.node" ).data( nodestr ) ),
            p = f.enter().append( "g" ).attr( "class", function ( t, e ) {
                return 0 === e ? "node active" : "node"
            } ).call( graphEvent.drag ).on( "click", function ( t ) {
                d3.event.defaultPrevented || console.log( '原站点关闭，取消链接跳转', t.href )
            } );

        p.append( "circle" ).attr( {
                r: 29,
                class: "ring"
            } ),
            p.append( "circle" ).attr( {
                r: 25,
                class: "outline"
            } ).style( {
                fill: function ( t ) {
                    return colors[ t.index ]
                },
                stroke: "#5CA8DB",
                "stroke-width": "2px"
            } ),
            p.append( "text" ).attr( "class", "nTxt" ).text( function ( t ) {
                return t.prop.nTxt
            } ).style( {
                fill: "black"
            } ),
            p.append( "text" ).attr( "class", "propName" ).text( function ( t ) {
                return t.prop.name
            } ).style( {
                fill: "black",
                "font-family": "SimSun"
            } ),
            graphEvent.start();

        for ( var x = 0; x < 50; x++ )
            graphEvent.tick();
        var g = setInterval( function () {
            graphEvent.alpha() < .01 ? clearInterval( g ) : graphEvent.tick()
        }, 80 );
    }

    /**
     * 初始化类别按钮的点击选择事件
     */
    var buttons = document.querySelector( '.kl_spread' );
    buttons.addEventListener( 'click', function ( e ) {
        /** @type HTMLDivElement */
        var dom = e.target;
        if (dom) {
            loadData( dom.innerText || dom.textContent );
        }
    } );

    /**
     * 加载类别列表
     */
    ajax( 'list.txt', function ( list ) {
        var content = '';
        list.split( '\n' ).forEach( function ( name ) {
            if ( name ) {
                content += '<button data-id="' + covertName(name) + '">' + name + '</button>'
            }
        } );
        buttons.innerHTML = content;
        var type = location.search.replace( /.*[?&]type=(\w+).*/, '$1' );
        loadData( /^\w+$/.test( type ) ? type : 'JavaScript' );
    } );

} )();
