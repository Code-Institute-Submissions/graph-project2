queue()
    .defer(d3.csv, "data/norway_new_car_sales_by_make.csv")
    .defer(d3.csv, "data/manufacturer_nation.csv")
    .await(makeGraph);


monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug", 
    "Sep", "Oct", "Nov", "Dec", 
    ]

function makeGraph(error, carsData, manufacturerData) {
    var ndx = crossfilter(carsData);
    
    
    carsData.forEach(function(car) {
        var result = manufacturerData.filter(function(manufacturer) {
            return manufacturer.Make === car.Make;
        });
        car.Country = (result[0] !== undefined) ? result[0].Country : null;
        if(!car.Country) {
            console.log(car);
        }
        
        
    });


    show_country_selector(ndx);
    show_quantity_sold(ndx);
    show_average_percentage_sold(ndx)
    show_total_sales_by_month(ndx) 
    show_sales_for_nine_years(ndx); 
    show_sales_for_a_year(ndx);
    dc.renderAll();
}

function show_country_selector(ndx) {
    dim = ndx.dimension(dc.pluck("Country"));
    group = dim.group();

    dc.selectMenu("#country_selector")
        .dimension(dim)
        .group(group)
}

function show_quantity_sold(ndx) {
    var dim = ndx.dimension(dc.pluck("Make"));
    var group = dim.group().reduceSum(dc.pluck("Quantity"));

  
    
        var chart = dc.rowChart("#quantity_sold");

        chart
            .width(600)
            .height(330)
            .dimension(dim)
            .group(group)
            .cap(10)
            .othersGrouper(false)
            .xAxis().ticks(4);
}

function show_total_sales_by_month(ndx) {  
    var dim = ndx.dimension(function(d){
        return monthNames[d.Month - 1]
    });
    var group = dim.group().reduceSum(dc.pluck("Quantity"));
    console.log(group.all())
    dc.barChart("#total_sales_by_month")
        .height(700)
        .width(600)
        .margins({ top: 10, right: 50, bottom: 30, left: 90 })
        .dimension(dim)
        .group(group)
        .transitionDuration(500)
        .x(d3.scale.ordinal().domain(monthNames))
        .xUnits(dc.units.ordinal)
        .elasticY(false)
        .xAxisLabel("Month")
        .yAxisLabel("Quantity")
        .yAxis().ticks(30)

        
}   



function show_sales_for_nine_years(ndx) {
    var dim = ndx.dimension(dc.pluck("Year"));
    
    var fordSalesByYear = dim.group().reduceSum(function (d) {
            if (d.Make === 'Ford') {
                return +d.Quantity;
            } else {
                return 0;
            }
        });

    var peugeotSalesByYear = dim.group().reduceSum(function (d) {
            if (d.Make === 'Peugeot') {
                return +d.Quantity;
            } else {
                return 0;
            }
        });
        
    var toyotaSalesByYear = dim.group().reduceSum(function (d) {
            if (d.Make === 'Toyota') {
                return +d.Quantity;
            } else {
                return 0;
            }
        });
    var compositeChart = dc.compositeChart('#sales_for_nine_years');
        compositeChart
            .width(990)
            .height(200)
            .dimension(dim)
            .x(d3.time.scale().domain([2007, 2017]))
            .yAxisLabel("The Y Axis")
            .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
            .renderHorizontalGridLines(true)
            .compose([
                dc.lineChart(compositeChart)
                    .colors('green')
                    .group(fordSalesByYear, 'Ford'),
                dc.lineChart(compositeChart)
                    .colors('red')
                    .group(peugeotSalesByYear, 'Peugeot'),
                dc.lineChart(compositeChart)
                    .colors('blue')
                    .group(toyotaSalesByYear, 'Toyota')
            ])
            .brushOn(false)
            .render();
    }    

function show_sales_for_a_year(ndx) {
  var dim = ndx.dimension(dc.pluck("Month"));
  var fordSalesByYear = dim.group().reduceSum(function (d) {
          if (d.Make === 'Volvo') {
              return +d.Quantity;
          } else {
              return 0;
          }
      });

  var pieChart = dc.pieChart('#sales_for_a_year');
      pieChart
  var dataset = [ 5, 10, 20, 20, 6, 25 ];
  var w = 500;
  var h = 500;
  var svg = d3.select("#sales_for_a_year")
          .append("svg")
          .attr("width", w)
          .attr("height", h);
  var outerRadius = w / 2;
  var innerRadius = w / 4;
  var arc = d3.svg.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);
  var pie = d3.layout.pie();
  var color = d3.scale.category10();
  var arcs = svg.selectAll("g.arc")
          .data(pie(dataset))
          .enter()
          .append("g")
          .attr("class", "arc")
          .attr("transform", "translate("+ outerRadius + ", " + outerRadius +")");
  arcs.append("path")
          .attr("fill", function(d, i) {
              return color(i)
          })
          .attr("d", arc);
  arcs.append("text")
          .attr("transform", function(d) {
              return "translate(" + arc.centroid(d) + ")";
          })
          .attr("text-anchor", "middle")
          .text(function(d) {
              return d.value;
          });

    }             


function show_average_percentage_sold(ndx) {
    var dim = ndx.dimension(dc.pluck("Pct"));

    function add_item(p, v) {
        p.count++;
        p.total += v.percentage;
        p.average = p.total / p.count;
        return p;
    }

    function remove_item(p, v) {
        p.count--;
        if (p.count == 0) {
            p.total = 0;
            p.average = 0;
        }
        else {
            p.total -= v.percentage;
            p.average = p.total / p.count;
        }
        return p;

    }

    function initialise() {
        return { count: 0, total: 0, average: 0 };

    }



    var averagePercentagebyBrand = dim.group().reduce(add_item, remove_item, initialise);



}