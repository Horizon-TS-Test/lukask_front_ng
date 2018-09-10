export default[
    {
        idCause: 'C1',
        description: 'Reclamos por falta de energía',
        termsAndConditions: {
            tittle : 'Reclamos por Falta de Servicio Eléctrico',
            content : [
                {
                    section0 : `Antes de presentar su reclamo por falta de servicio eléctrico es 
                                necesario que verifique lo siguiente:`
                },
                {
                    section1 : [
                        {item : '¿Está el día en sus pagos?'},
                        {item : '¿Su servicio fue cortado por falta de pago?'},
                        {item : `¿Existe algún daño al interior de su domicilio, es decir en las 
                                 instalaciones eléctricas posteriores al medidor?, tenga presente 
                                 que la EERSA procederá a la reparación únicamente si los daños se 
                                 presentan hasta el medidor.`},
                    ]
                },
                {
                    section2 : 'Al presentar su reclamo proporcione los datos que se detallan a continuación, los cuales nos permitirán atenderle en el menor tiempo:'
                },
                {
                    section3 : [
                       {item : 'Número de Cta. Cliente, registrado en su Factura de Consumo'},
                       {item : 'Nombres y apellidos de la persona que atenderá al personal de la EERSA'},
                       {item : 'Dirección completa: barrio o sector, calle, intersección, número de casa o lote; alguna referencia adicional de ubicación'},
                       {item : 'Número de teléfono'},
                       {item : 'El motivo de su reclamo'}
                    ]
                }
            ]
        }
    },
    {
        idCause: 'C2',
        description: 'Reclamos por falta de alumbrado público',
        termsAndConditions: {
            tittle : 'Reclamos por Falta de Alumbrado Público',
            content : [
                {
                    section0 : `Si usted tiene una falla en el alumbrado público cercano a su 
                                domicilio, empresa u oficina el problema puede ser reportado 
                                llamando a la línea directa de atención 136, registrando en línea 
                                su reclamo o acercándose personalmente a la oficina de Atención al 
                                Cliente ubicada en las calles Gracia Moreno y 10 de Agosto.`
                },
                {
                    section1 : `Al presentar su reclamo proporcione los datos que se detallan a 
                                continuación, los cuales nos permitirán atenderle en el menor tiempo:`
                },
                {
                    section2 : [
                        {item : `Número de Cta. Cliente, registrado en su Factura de Consumo`},
                        {item : `Nombres y apellidos de la persona que atenderá al personal de la EERSA`},
                        {item : `Dirección completa: barrio o sector, calle, intersección, número de 
                                 casa o lote; alguna referencia adicional de ubicación`},
                        {item : `Número de teléfono`},
                        {item : `Indique de ser posible el número de poste donde se encuentra el daño.`}
                    ] 
                }
            ]
        }
    },
    {
        idCause: 'C3',
        description: 'Reclamos Comerciales',
        termsAndConditions: {
          tittle : 'Reclamos Comerciales',
          content : [
              {
                  section0 : 'Los reclamos comerciales comprenden aquellos originados por los siguientes aspectos:'
              },
              {
                  section1 : [
                      {item :  `Cuando usted considere que existe errores en los valores facturados en 
                                su planilla de consumo.`},
                      {item : `Si hay demora en la reconexión del servicio eléctrico luego de haber 
                               cancelado las facturas pendientes.`},
                      {item : 'Si considera que existen errores en las lecturas registradas.'}
                  ]
              },
              {
                  section2 : `Al presentar su reclamo proporcione los datos que se detallan a 
                              continuación, los cuales nos permitirán atenderle en el menor tiempo:`
              },
              {
                 section3 : [
                     {item : 'Número de Cta. Cliente, registrado en su Factura de Consumo'},
                     {item : 'Nombres y apellidos de la persona que atenderá al personal de la EERSA'},
                     {item : `Dirección completa: barrio o sector, calle, intersección, número de casa o 
                              lote; alguna referencia adicional de ubicación`},
                     {item : 'Número de teléfono'},
                     {item : 'El motivo del reclamo'}
                 ]
              }
          ]
        }
    },
    {
        idCause: 'C4',
        description: 'Reclamos por daño de artefactos',
        termsAndConditions: {
            tittle : 'Reclamos por daños de artefactos y/o equipos eléctricos o electrónicos.',
            content : [
                {
                    section0 : `Corresponde a los reclamos de daños de artefactos debidos a la 
                                deficiencia en la prestación del servicio.`,
                },
                {
                    section1 : `No constituye motivo de reclamo la falta de suministro de energía 
                                que haya sido causado por caso fortuito o fuerza mayor declarado 
                                por autoridad competente.`,
                },
                {
                    section2 : `Los reclamos podrán ser presentados por parte de los consumidores, 
                                en un plazo máximo de 30 días, contados a partir de la ocurrencia 
                                del evento.`,
                },
                {
                    section3 : 'Consideraciones Especiales',
                    type : 'subTitulo'
                },
                {
                    section3 : [
                       {
                            item : 'Daños Imputables y No Imputables',
                            type : 'numeracion' 
                       },
                       {
                            item : 'Causales de daño imputables al distribuidor',
                            type : 'subTituloInterno' 
                       },
                       {
                            item : `Instalaciones y conexiones defectuosas en la red, acometida o sistema 
                                    de medición hasta el punto de entrega al consumidor.`,
                            type : 'vinieta'
                       },
                       {
                           item : 'Operación inadecuada del sistema de distribución.',
                           type : 'vinieta'
                       },
                       {
                           item : 'Deficiencias en la calidad del producto proporcionado por el distribuidor.',
                           type : 'vinieta'
                       },
                       {
                           item : 'Causales de daño no imputables al distribuidor.',
                           type : 'subtitulo'
                       },
                       {
                           item : 'Daños producidos por fuerza mayor o caso fortuito, conforme lo establecido en el Art. 30 del Código Civil.',
                           type : 'vinieta'
                       },
                       {
                           item : `Operaciones, interrupciones y reconexiones del sistema eléctrico, en forma total o parcial, 
                                   que hayan sido debida y oportunamente informadas por el distribuidor.`,
                           type : 'vinieta'
                       },
                       {
                           item : 'Operaciones e interrupciones del sistema eléctrico, causadas por otros agentes del sector eléctrico.',
                           type : 'viniete'
                       },
                       {
                           item : 'Daños producidos por fallas internas del consumidor.',
                           type : 'viniete'
                       },
                       {
                           item : 'Reconocimiento de Daños',
                           type : 'numeracion'
                       },
                       {
                           item : `Una vez que se ha obtenido el informe favorable por parte del distribuidor y los equipos a revisar, 
                                   el consumidor, deberá llevar su artefacto a los talleres calificados. En caso sea factible su 
                                   arreglo se procederá con el mismo, y éstos últimos remitirán la siguiente información al Distribuidor:`,
                           type : 'subParrafo'
                       },
                       {
                           item : 'Fecha en que se realizó la revisión del o los artefactos.',
                           type : 'viniete'
                       },
                       {
                           item : 'Detalle de las características de cada uno de los artefactos dañados (marca, modelo, número de serie, etc.).',
                           type : 'viniete'
                       },
                       {
                           item : 'Descripción detallada de cada uno de los componentes que fueron dañados en cada artefacto.',
                           type : 'viniete'
                       },
                       {
                           item : 'El costo total de reparación que debe incluir materiales a ser reemplazados, mano de obra e impuestos.',
                           type : 'viniete'
                       },
                       {
                           item : 'Vigencia del presupuesto.',
                           type : 'viniete'
                       },
                       {
                           item : `El pago de la reparación de los equipos se lo establecerá a través de convenios de pagos que realice 
                                   la empresa distribuidora y los talleres calificados.`,
                           type : 'subParrafo' 
                       },
                       {
                           item : `En caso no sea posible la (s) refacción (nes) de (l) equipo (s) el consumidor (pérdida total del bien) 
                                   solicitará al taller un informe técnico que evidencie esta imposibilidad, y conjuntamente con este 
                                   informe presentará la siguiente información adicional:`,
                           type : 'subParrafo'
                       },
                       {
                           item : 'Año de fabricación del artefacto eléctrico.',
                           type : 'viniete'
                       },
                       {
                           item : 'Una pro forma de compra de un artefacto de características similares al dañado.',
                           type : 'viniete'
                       },
                       {
                           item : `Una vez cumplida la entrega de la información, el distribuidor por parte del consumidor, 
                                   es responsabilidad del distribuidor el reconocer el daño ocasionado.`,
                           type : 'subParrafo' 
                       }
                    ]
                },

            ]
        }
    }
]